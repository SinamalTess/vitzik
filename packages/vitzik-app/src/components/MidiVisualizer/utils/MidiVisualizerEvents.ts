import { AlphabeticalNote } from '../../../types'

export type MidiVisualizerEventType = 'note'

export interface Coordinates {
    w: number
    h: number
    x: number
    y: number
}

export interface MidiVisualizerEvent extends Coordinates {
    eventType: MidiVisualizerEventType
    startingTime: number
}

export interface MidiVisualizerNoteEvent extends MidiVisualizerEvent {
    /*
        Some notes don't have associated names because they are just frequencies
        See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
    */
    name?: AlphabeticalNote
    key: number
    velocity: number // [0 - 127]
    duration: number // ms
    channel: number // [0 - 15]
    startingTime: number // ms
    uniqueId: string
}
