import {
    IMidiFile,
    IMidiNoteOffEvent,
    IMidiNoteOnEvent,
    IMidiSetTempoEvent,
    TMidiEvent,
} from 'midi-json-parser-worker'
import {
    ActiveNote,
    Instrument,
    InstrumentUserFriendlyName,
    MidiInfos,
    MidiJsonNote,
} from '../types'
import { IMidiProgramChangeEvent } from 'midi-json-parser-worker/src/interfaces'
import { MIDI_INSTRUMENTS } from './const'
import { largestNum } from './maths'
import { keyToNote } from './notes'

type EventType = 'setTempo' | 'noteOn' | 'noteOff'

export const isNoteOnEvent = (note: TMidiEvent): note is IMidiNoteOnEvent => 'noteOn' in note
export const isNoteOffEvent = (note: TMidiEvent): note is IMidiNoteOffEvent => 'noteOff' in note
export const isProgramChangeEvent = (event: TMidiEvent): event is IMidiProgramChangeEvent =>
    'programChange' in event
export const isSetTempoEvent = (event: TMidiEvent): event is IMidiSetTempoEvent =>
    'setTempo' in event

const isTrackPlayable = (track: TMidiEvent[]) => track.some((event) => isNoteOnEvent(event))

export const getFormat = (midiJson: IMidiFile): number => midiJson.format

const getNbTicks = (track: TMidiEvent[]) =>
    track.reduce((acc, nextEvent) => acc + nextEvent.delta, 0)

const programNumberToInstrument = (programNumber: number): InstrumentUserFriendlyName =>
    MIDI_INSTRUMENTS[programNumber]

export const getKey = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.noteNumber : note.noteOff.noteNumber

export const getVelocity = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.velocity : note.noteOff.velocity

export const getNoteMetas = (note: MidiJsonNote): ActiveNote => {
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

function getAllEventsOfType(track: TMidiEvent[], eventType: EventType) {
    switch (eventType) {
        case 'setTempo':
            return track.filter((event) => isSetTempoEvent(event))
        case 'noteOff':
            return track.filter((event) => isNoteOffEvent(event))
        case 'noteOn':
            return track.filter((event) => isNoteOnEvent(event))
        default:
            return []
    }
}

function getLastTempoValue(track: TMidiEvent[]) {
    const setTempoEvents = getAllEventsOfType(track, 'setTempo') as IMidiSetTempoEvent[]

    if (setTempoEvents.length > 1) {
        const lastSetTempo = setTempoEvents[setTempoEvents.length - 1]
        const { microsecondsPerQuarter } = lastSetTempo.setTempo
        return Math.round(microsecondsPerQuarter / 1000)
    }
}

function getMsPerBeat(midiJson: IMidiFile): number {
    const format = getFormat(midiJson)
    const defaultTempo = 60000 / 120 // 120 beats per minute is the default value
    const firstTrack = midiJson.tracks[0] // TODO: a tempo can be changed in the middle of the file
    switch (format) {
        case 0: // TODO: complete this section
            return defaultTempo
        case 1:
            const msPerBeat = getLastTempoValue(firstTrack)
            if (msPerBeat) {
                return msPerBeat
            }
            return defaultTempo

        case 2: // TODO: complete this section
            return defaultTempo
        default:
            return defaultTempo
    }
}

export function getMidiInfos(midiJson: IMidiFile | null): MidiInfos | null {
    if (!midiJson) return null

    let playableTracksIndexes: number[] = []
    let initialInstruments: Instrument[] = []

    midiJson.tracks.forEach((track, index) => {
        if (isTrackPlayable(track)) {
            playableTracksIndexes.push(index)
        }
        track.forEach((event) => {
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

    const nbTicks = largestNum(midiJson.tracks.map((track) => getNbTicks(track)))
    const ticksPerBeat = getTicksPerBeat(midiJson)
    const nbBeats = nbTicks / ticksPerBeat
    const msPerBeat = getMsPerBeat(midiJson)
    const format = getFormat(midiJson)

    return {
        msPerBeat,
        ticksPerBeat,
        midiDuration: nbBeats * msPerBeat,
        format,
        initialInstruments,
        playableTracksIndexes,
    }
}
