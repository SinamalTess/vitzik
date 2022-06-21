import {
    IMidiFile,
    IMidiNoteOffEvent,
    IMidiNoteOnEvent,
    IMidiSetTempoEvent,
    TMidiEvent,
} from 'midi-json-parser-worker'
import { Instrument, MidiInfos } from '../types'
import { IMidiProgramChangeEvent } from 'midi-json-parser-worker/src/interfaces'
import { MIDI_INSTRUMENTS } from './const'

//TODO: try to minimize number of loops

export const getFormat = (midiJson: IMidiFile): number => midiJson.format
export const isNoteOnEvent = (note: TMidiEvent): note is IMidiNoteOnEvent => 'noteOn' in note
export const isNoteOffEvent = (note: TMidiEvent): note is IMidiNoteOffEvent => 'noteOff' in note
export const isProgramChangeEvent = (event: TMidiEvent): event is IMidiProgramChangeEvent =>
    'programChange' in event

const programNumberToInstrument = (programNumber: number): Instrument =>
    MIDI_INSTRUMENTS[programNumber]

export function getTicksPerBeat(midiJson: IMidiFile) {
    const { division } = midiJson
    const value = Math.sign(division)
    const isTickPerBeat = value === 0 || value === 1

    if (isTickPerBeat) {
        console.log(
            `The file is using ticks per beat, there are ${division} ticks per beat (quarter note)`
        )
    } else {
        console.log(`The file is using SMPTE units`) // TODO: complete this section
    }

    return division
}

export function getMsPerBeat(midiJson: IMidiFile): number {
    const format = getFormat(midiJson)
    const defaultTempo = 60000 / 120 // 120 beats per minute is the default value
    switch (format) {
        case 0: // TODO: complete this section
            return defaultTempo
        case 1:
            const setTempoEvents = midiJson.tracks[0].filter((event) =>
                event.hasOwnProperty('setTempo')
            ) as IMidiSetTempoEvent[]

            if (setTempoEvents.length > 1) {
                const lastSetTempo = setTempoEvents[setTempoEvents.length - 1]
                const { microsecondsPerQuarter } = lastSetTempo.setTempo
                const msPerBeat = Math.round(microsecondsPerQuarter / 1000)

                console.log(`There are ${msPerBeat} milliseconds per quarter note (beat)`)

                return msPerBeat
            }

            return defaultTempo

        case 2: // TODO: complete this section
            return defaultTempo
        default:
            return defaultTempo
    }
}

function getPlayableTracks(midiFile: IMidiFile | null) {
    if (!midiFile) return []

    const { tracks } = midiFile

    let playableTracksIndexes: number[] = []

    tracks.forEach((track, index) => {
        const isPlayableTrack = track.some((event) => isNoteOnEvent(event))
        if (isPlayableTrack) {
            playableTracksIndexes.push(index)
        }
    })

    return playableTracksIndexes
}

function getInitialChannelInstruments(midiJson: IMidiFile) {
    const { tracks } = midiJson
    let channels = new Map()
    tracks.forEach((track) => {
        track.forEach((event) => {
            if (isProgramChangeEvent(event)) {
                const { channel } = event
                const { programNumber } = event.programChange
                if (!channels.has(channel)) {
                    channels.set(channel, programNumberToInstrument(programNumber))
                }
            }
        })
    })
    return channels
}

export function getMidiInfos(midiJson: IMidiFile | null): MidiInfos | null {
    if (!midiJson) return null

    const nbTicks = midiJson.tracks[0].reduce((acc, nextEvent) => acc + nextEvent.delta, 0) //TODO: check if all track last the same
    const ticksPerBeat = getTicksPerBeat(midiJson)
    const nbBeats = nbTicks / ticksPerBeat
    const msPerBeat = getMsPerBeat(midiJson)
    const format = getFormat(midiJson)
    const initialChannelInstruments = getInitialChannelInstruments(midiJson)
    const playableTracksIndexes = getPlayableTracks(midiJson)

    return {
        msPerBeat,
        ticksPerBeat,
        midiDuration: nbBeats * msPerBeat,
        format,
        initialChannelInstruments,
        playableTracksIndexes,
    }
}
