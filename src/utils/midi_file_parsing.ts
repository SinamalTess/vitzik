import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker'
import {
    Instrument,
    InstrumentUserFriendlyName,
    MidiMetas,
    TrackMetas,
    MidiJsonNote,
    MidiInputActiveNote,
    MsPerBeat,
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

function getAllMsPerBeat(trackMetas: TrackMetas) {
    let allMsPerBeat: MsPerBeat[] = []
    for (const i in trackMetas) {
        if (Array.isArray(trackMetas[i].msPerBeat)) {
            allMsPerBeat = [...allMsPerBeat, ...(trackMetas[i].msPerBeat as MsPerBeat[])]
        }
    }

    return allMsPerBeat.sort((a, b) => a.delta - b.delta).flat(1) // smallest delta values first
}

export function getMidiDuration(allMsPerBeat: MsPerBeat[], nbTicks: number, ticksPerBeat: number) {
    const { value, timestamp, delta } = allMsPerBeat[allMsPerBeat.length - 1] // last value
    const timeLeft = ((nbTicks - delta) / ticksPerBeat) * value
    return timestamp + timeLeft
}

export function getMidiMetas(midiJson: IMidiFile): MidiMetas {
    let playableTracks: number[] = []
    let initialInstruments: Instrument[] = []
    let trackMetas: TrackMetas = {}
    const ticksPerBeat = getTicksPerBeat(midiJson)

    midiJson.tracks.forEach((track, index) => {
        let deltaAcc = 0

        if (isTrackPlayable(track)) {
            playableTracks.push(index)
        }

        const addToTrackMetas = (property: any) => {
            trackMetas = {
                ...trackMetas,
                [index]: {
                    ...trackMetas[index],
                    ...property,
                },
            }
        }

        track.forEach((event) => {
            deltaAcc = deltaAcc + event.delta

            addToTrackMetas({
                nbTicks: deltaAcc,
            })

            if (isTrackNameEvent(event)) {
                const previousNames = trackMetas[index]?.names ? trackMetas[index].names : []
                addToTrackMetas({
                    names: [...(previousNames as string[]), event.trackName],
                })
            }
            if (isSetTempoEvent(event)) {
                const { microsecondsPerQuarter } = event.setTempo

                const previousMsPerBeat = trackMetas[index]?.msPerBeat ?? []
                const currentMsPerBeatValue = microSPerBeatToMsPerBeat(microsecondsPerQuarter)
                let newTimestamp = (deltaAcc / ticksPerBeat) * currentMsPerBeatValue

                if (previousMsPerBeat.length) {
                    const { value, delta, timestamp } =
                        previousMsPerBeat[previousMsPerBeat.length - 1]
                    newTimestamp = ((deltaAcc - delta) / ticksPerBeat) * value + timestamp
                }

                addToTrackMetas({
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
                addToTrackMetas({
                    timeSignature: event.timeSignature,
                })
            }
            if (isKeySignatureEvent(event)) {
                addToTrackMetas({
                    keySignature: event.keySignature,
                })
            }
            if (isProgramChangeEvent(event)) {
                const { channel } = event
                const { programNumber } = event.programChange
                const isChannelFound = initialInstruments.find(
                    (instrument) => instrument.channel === channel
                )
                if (!isChannelFound) {
                    initialInstruments.push({
                        channel,
                        name: programNumberToInstrument(programNumber),
                        index: programNumber,
                    })
                }
            }
        })
    })

    const allMsPerBeat = getAllMsPerBeat(trackMetas)
    const nbTicks = largestNum(midiJson.tracks.map((track) => getNbTicksInTrack(track))) //TODO: this would only work for format 0 and 1

    return {
        ticksPerBeat,
        midiDuration: getMidiDuration(allMsPerBeat, nbTicks, ticksPerBeat),
        format: getFormat(midiJson),
        initialInstruments,
        playableTracks,
        trackMetas,
        allMsPerBeat,
    }
}
