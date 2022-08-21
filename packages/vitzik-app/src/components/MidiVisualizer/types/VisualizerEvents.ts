import { AlphabeticalNote } from '../../../types'

export type VisualizerEventType = 'note'

export interface Coordinates {
    w: number
    h: number
    x: number
    y: number
}

export interface VisualizerEvent extends Coordinates {
    eventType: VisualizerEventType
    startingTime: number
}

export interface VisualizerNoteEvent extends VisualizerEvent {
    // Some notes don't have associated names because they are just frequencies
    // See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
    name?: AlphabeticalNote
    key: number
    velocity: number
    duration: number
    channel: number
    startingTime: number
    uniqueId: string
}
