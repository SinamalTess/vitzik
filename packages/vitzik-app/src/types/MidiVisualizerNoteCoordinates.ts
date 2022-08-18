import { RectangleCoordinates } from './RectangleCoordinates'
import { AlphabeticalNote } from './Notes'

export interface MidiVisualizerNoteCoordinates extends RectangleCoordinates {
    /*
        Some notes don't have associated names because they are just frequencies
        See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
    */
    name?: AlphabeticalNote
    key: number
    velocity: number // [0 - 127]
    duration: number // ms
    id: string
    channel: number // [0 - 15]
    startingTime: number // ms
}
