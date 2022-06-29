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

const isTrackPlayable = (track: TMidiEvent[]) => track.some((event) => isNoteOnEvent(event))

const getNbTicksInTrack = (track: TMidiEvent[]) =>
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
            allMsPerBeat = [...allMsPerBeat, ...trackMetas[i].msPerBeat]
        }
    }

    return allMsPerBeat.sort((a, b) => a.delta - b.delta).flat(1) // smallest values first
}

function getMidiDuration(allMsPerBeats: MsPerBeat[], nbTicks: number, ticksPerBeat: number) {
    const lastValue = Math.max(allMsPerBeats.length - 1, 0)
    const lastMsPerBeatValue = allMsPerBeats[lastValue].value
    const lastTicks = allMsPerBeats[lastValue].delta
    const lastTime = allMsPerBeats[lastValue].timestamp
    const timeRemaining = ((nbTicks - lastTicks) / ticksPerBeat) * lastMsPerBeatValue
    return lastTime + timeRemaining
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
        track.forEach((event) => {
            deltaAcc = deltaAcc + event.delta
            trackMetas = {
                ...trackMetas,
                [index]: {
                    ...trackMetas[index],
                    nbTicks: deltaAcc,
                },
            }

            if (isTrackNameEvent(event)) {
                const previousNames = trackMetas[index]?.names ? trackMetas[index].names : []
                trackMetas = {
                    ...trackMetas,
                    [index]: {
                        ...trackMetas[index],
                        names: [...previousNames, event.trackName],
                    },
                }
            }
            if (isSetTempoEvent(event)) {
                const { microsecondsPerQuarter } = event.setTempo

                const previousMsPerBeat = trackMetas[index]?.msPerBeat ?? []
                const currentMsPerBeatValue = microSPerBeatToMsPerBeat(microsecondsPerQuarter)
                let timestamp = (deltaAcc / ticksPerBeat) * currentMsPerBeatValue

                if (previousMsPerBeat.length) {
                    const lastValue = Math.max(previousMsPerBeat.length - 1, 0)
                    const previousValue = previousMsPerBeat[lastValue].value
                    const previousDelta = previousMsPerBeat[lastValue].delta
                    const previousTimestamp = previousMsPerBeat[lastValue].timestamp
                    timestamp =
                        ((deltaAcc - previousDelta) / ticksPerBeat) * previousValue +
                        previousTimestamp
                }

                trackMetas = {
                    ...trackMetas,
                    [index]: {
                        ...trackMetas[index],
                        msPerBeat: [
                            ...previousMsPerBeat,
                            {
                                value: currentMsPerBeatValue,
                                timestamp,
                                delta: deltaAcc,
                            },
                        ],
                    },
                }
            }
            if (isTimeSignatureEvent(event)) {
                trackMetas = {
                    ...trackMetas,
                    [index]: {
                        ...trackMetas[index],
                        timeSignature: event.timeSignature,
                    },
                }
            }
            if (isKeySignatureEvent(event)) {
                trackMetas = {
                    ...trackMetas,
                    [index]: {
                        ...trackMetas[index],
                        keySignature: event.keySignature,
                    },
                }
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
