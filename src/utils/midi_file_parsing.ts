import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker'
import {
    InstrumentUserFriendlyName,
    MidiMetas,
    TrackMetas,
    MidiJsonNote,
    MidiInputActiveNote,
    MsPerBeat,
    AlphabeticalNote,
    Instrument,
} from '../types'
import { MIDI_INSTRUMENTS } from './const'
import { keyToNote } from './notes'
import {
    isKeySignatureEvent,
    isNoteOnEvent,
    isProgramChangeEvent,
    isSetTempoEvent,
    isTimeSignatureEvent,
    isTrackNameEvent,
} from './midi_events'
import assign from 'lodash/assign'
import findLast from 'lodash/findLast'
import last from 'lodash/last'
import max from 'lodash/max'
import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import { isPositive } from './maths'

export const isTrackPlayable = (track: TMidiEvent[]) => track.some((event) => isNoteOnEvent(event))

export const getNbTicksInTrack = (track: TMidiEvent[]) =>
    track.reduce((acc, nextEvent) => acc + nextEvent.delta, 0)

export const getFormat = (midiJson: IMidiFile): number => midiJson.format

const programNumberToInstrument = (programNumber: number): InstrumentUserFriendlyName =>
    MIDI_INSTRUMENTS[programNumber]

export const getKeyFomNote = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.noteNumber : note.noteOff.noteNumber

export const getVelocity = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.velocity : note.noteOff.velocity

const microSPerBeatToMsPerBeat = (microsecondsPerQuarter: number) =>
    Math.round(microsecondsPerQuarter / 1000)

export const msPerBeatToBpm = (msPerBeat: number) => (1000 * 60) / msPerBeat

export const bpmToMsPerBeat = (beatPerMin: number) => (60 * 1000) / beatPerMin

export const getNoteMetas = (note: MidiJsonNote): MidiInputActiveNote => {
    const { channel } = note
    const key = getKeyFomNote(note)
    const name = keyToNote(key)
    const velocity = getVelocity(note)

    return {
        key,
        name,
        velocity,
        channel,
    }
}

export function normalizeTitle(title: string) {
    const normalizedTitle = title.replace('_', ' ')
    const results = normalizedTitle.match(/.midi|.mid/) ?? []
    if (results.length > 0) {
        return normalizedTitle.slice(0, normalizedTitle.length - results[0].length)
    }
    return normalizedTitle
}

export function getTicksPerBeat(midiJson: IMidiFile) {
    const { division } = midiJson
    if (isPositive(division)) {
        // The "division" is equal to the ticks per beat (beat = quarter note)
        return division
    } else {
        // The file is using SMPTE units (ticks per frame)
        throw new Error(
            'Congratulations you have found a SMPTE formatted midi file, a rare gem, I have no idea how to process it...yet'
        )
    }
}

export function getInitialMsPerBeat(allMsPerBeats: MsPerBeat[]) {
    return allMsPerBeats.reduce((acc, value) => {
        // sometimes multiple tempo with delta = 0 exists, this returns the last
        if (acc.delta === value.delta) {
            return value
        } else {
            return acc
        }
    }).value
}

function getAllMsPerBeat(trackMetas: TrackMetas[]) {
    const allMsPerBeat = trackMetas.reduce((acc, val) => {
        return [...acc, ...val.msPerBeat]
    }, [] as MsPerBeat[])

    return sortBy(allMsPerBeat, 'delta').flat(1)
}

export function getMsPerBeatFromDelta(delta: number, allMsPerBeat: MsPerBeat[]) {
    return findLast(allMsPerBeat, (msPerBeat) => msPerBeat.delta <= delta)
}

export function deltaToTime(allMsPerBeat: MsPerBeat[], delta: number, ticksPerBeat: number) {
    const lastMsPerBeat = getMsPerBeatFromDelta(delta, allMsPerBeat)

    if (lastMsPerBeat) {
        const { timestamp, delta: lastDelta, value } = lastMsPerBeat
        return timestamp + ((delta - lastDelta) / ticksPerBeat) * value
    }

    return 0
}

export function getInitialInstruments(instruments: Instrument[]) {
    return uniqBy(instruments, 'channel')
}

export function getMidiDuration(allMsPerBeat: MsPerBeat[], nbTicks: number, ticksPerBeat: number) {
    const lastMsPerBeat = last(allMsPerBeat)

    if (lastMsPerBeat) {
        const { value, timestamp, delta } = lastMsPerBeat
        const timeLeft = ((nbTicks - delta) / ticksPerBeat) * value
        return timestamp + timeLeft
    }

    return 0
}

export function getMidiMetas(midiJson: IMidiFile): MidiMetas {
    let tracksMetas: TrackMetas[] = []
    let instruments: Instrument[] = []
    const ticksPerBeat = getTicksPerBeat(midiJson)

    midiJson.tracks.forEach((track, index) => {
        let deltaAcc = 0
        let trackMetas: TrackMetas = {
            index,
            nbTicks: deltaAcc,
            channels: new Set<number>(),
            isPlayable: false,
            names: [],
            msPerBeat: [],
        }

        if (isTrackPlayable(track)) {
            assign(trackMetas, {
                isPlayable: true,
            })
        }

        track.forEach((event) => {
            deltaAcc = deltaAcc + event.delta

            assign(trackMetas, {
                nbTicks: deltaAcc,
            })

            if (isProgramChangeEvent(event)) {
                const { channel } = event
                const { programNumber } = event.programChange
                const instrument = {
                    channel,
                    delta: deltaAcc,
                    timestamp: 0, // to be replaced once we know allMsPerBeat values
                    name: programNumberToInstrument(programNumber),
                    index: programNumber,
                    notes: new Set(),
                } as Instrument
                instruments.push(instrument)
            }

            if (isNoteOnEvent(event)) {
                assign(trackMetas, {
                    channels: trackMetas.channels.add(event.channel),
                })

                // Finds instrument playing the note
                const instrument = instruments
                    .sort((a, b) => b.delta - a.delta) // sort by largest delta first
                    .find(({ delta, channel }) => delta <= deltaAcc && channel === event.channel)

                if (instrument) {
                    instrument.notes.add(keyToNote(event.noteOn.noteNumber) as AlphabeticalNote)
                }
            }

            if (isTrackNameEvent(event)) {
                assign(trackMetas, {
                    names: [...trackMetas.names, event.trackName],
                })
            }

            if (isSetTempoEvent(event)) {
                const { microsecondsPerQuarter } = event.setTempo

                const previousMsPerBeat = last(trackMetas.msPerBeat)
                const currentMsPerBeatValue = microSPerBeatToMsPerBeat(microsecondsPerQuarter)
                let newTimestamp = (deltaAcc / ticksPerBeat) * currentMsPerBeatValue

                if (previousMsPerBeat) {
                    const { value, delta, timestamp } = previousMsPerBeat
                    newTimestamp = ((deltaAcc - delta) / ticksPerBeat) * value + timestamp
                }

                assign(trackMetas, {
                    msPerBeat: [
                        ...trackMetas.msPerBeat,
                        {
                            value: currentMsPerBeatValue,
                            timestamp: newTimestamp,
                            delta: deltaAcc,
                        },
                    ],
                })
            }

            if (isTimeSignatureEvent(event)) {
                const { timeSignature } = event
                assign(trackMetas, {
                    timeSignature,
                })
            }

            if (isKeySignatureEvent(event)) {
                const { keySignature } = event
                assign(trackMetas, {
                    keySignature,
                })
            }
        })

        tracksMetas.push(trackMetas)
    })

    const allMsPerBeat = getAllMsPerBeat(tracksMetas)
    const nbTicks = max(midiJson.tracks.map((track) => getNbTicksInTrack(track))) ?? 0 // TODO: this would only work for format 0 and 1

    const finalInstruments = instruments
        .filter((instrument) => instrument.notes.size) // remove instruments without notes
        .map((instrument) => {
            const { delta } = instrument
            // calculates final timestamp of instruments
            return {
                ...instrument,
                timestamp: deltaToTime(allMsPerBeat, delta, ticksPerBeat),
            }
        })

    return {
        ticksPerBeat,
        midiDuration: getMidiDuration(allMsPerBeat, nbTicks, ticksPerBeat),
        format: getFormat(midiJson),
        instruments: sortBy(finalInstruments, 'delta'),
        tracksMetas,
        allMsPerBeat,
    }
}
