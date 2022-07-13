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
import { largestNum } from './maths'
import { keyToNote } from './notes'
import {
    isKeySignatureEvent,
    isNoteOnEvent,
    isProgramChangeEvent,
    isSetTempoEvent,
    isTimeSignatureEvent,
    isTrackNameEvent,
} from './midi_events'
import { assign, uniqBy } from 'lodash'

export const isTrackPlayable = (track: TMidiEvent[]) => track.some((event) => isNoteOnEvent(event))

export const getNbTicksInTrack = (track: TMidiEvent[]) =>
    track.reduce((acc, nextEvent) => acc + nextEvent.delta, 0)

export const getFormat = (midiJson: IMidiFile): number => midiJson.format

const programNumberToInstrument = (programNumber: number): InstrumentUserFriendlyName =>
    MIDI_INSTRUMENTS[programNumber]

export const getKey = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.noteNumber : note.noteOff.noteNumber

export const getVelocity = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.velocity : note.noteOff.velocity

const microSPerBeatToMsPerBeat = (microsecondsPerQuarter: number) =>
    Math.round(microsecondsPerQuarter / 1000)

export const msPerBeatToBeatPerMin = (msPerBeat: number) => (1000 * 60) / msPerBeat

export const beatPerMinToMsPerBeat = (beatPerMin: number) => (60 * 1000) / beatPerMin

export const getNoteMetas = (note: MidiJsonNote): MidiInputActiveNote => {
    const { channel } = note
    const key = getKey(note)
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
    const value = Math.sign(division)
    const isValuePositive = value === 0 || value === 1

    if (isValuePositive) {
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
    let allMsPerBeat: MsPerBeat[] = []
    trackMetas.forEach((track) => {
        if (Array.isArray(track.msPerBeat)) {
            allMsPerBeat = [...allMsPerBeat, ...(track.msPerBeat as MsPerBeat[])]
        }
    })

    return allMsPerBeat.sort((a, b) => a.delta - b.delta).flat(1) // smallest delta values first
}

export function getMsPerBeatFromDelta(delta: number, allMsPerBeat: MsPerBeat[]) {
    const passedMsPerBeat = allMsPerBeat.filter((msPerBeat) => msPerBeat.delta <= delta)

    return passedMsPerBeat[passedMsPerBeat.length - 1]
}

export function deltaToTime(allMsPerBeat: MsPerBeat[], delta: number, ticksPerBeat: number) {
    const lastMsPerBeat = getMsPerBeatFromDelta(delta, allMsPerBeat)
    return (
        lastMsPerBeat.timestamp +
        ((delta - lastMsPerBeat.delta) / ticksPerBeat) * lastMsPerBeat.value
    )
}

export function getInitialInstruments(instruments: Instrument[]) {
    return uniqBy(instruments, 'channel')
}

export function getMidiDuration(allMsPerBeat: MsPerBeat[], nbTicks: number, ticksPerBeat: number) {
    const { value, timestamp, delta } = allMsPerBeat[allMsPerBeat.length - 1] // last value
    const timeLeft = ((nbTicks - delta) / ticksPerBeat) * value
    return timestamp + timeLeft
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
                    timestamp: 0,
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

                const previousMsPerBeat = trackMetas.msPerBeat ?? []
                const currentMsPerBeatValue = microSPerBeatToMsPerBeat(microsecondsPerQuarter)
                let newTimestamp = (deltaAcc / ticksPerBeat) * currentMsPerBeatValue

                if (previousMsPerBeat.length) {
                    const { value, delta, timestamp } =
                        previousMsPerBeat[previousMsPerBeat.length - 1]
                    newTimestamp = ((deltaAcc - delta) / ticksPerBeat) * value + timestamp
                }

                assign(trackMetas, {
                    msPerBeat: [
                        ...previousMsPerBeat,
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
    const nbTicks = largestNum(midiJson.tracks.map((track) => getNbTicksInTrack(track))) //TODO: this would only work for format 0 and 1

    const finalInstruments = instruments
        .filter((instrument) => instrument.notes.size) // remove instruments without notes
        .map((instrument) => {
            // calculates final timestamp of instruments
            return {
                ...instrument,
                timestamp: deltaToTime(allMsPerBeat, instrument.delta, ticksPerBeat),
            }
        })
        .sort((a, b) => a.delta - b.delta) // smallest delta values first

    return {
        ticksPerBeat,
        midiDuration: getMidiDuration(allMsPerBeat, nbTicks, ticksPerBeat),
        format: getFormat(midiJson),
        instruments: finalInstruments,
        tracksMetas,
        allMsPerBeat,
    }
}
