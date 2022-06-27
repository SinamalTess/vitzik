import { CanvasRectangle } from './Canvas'
import { AlphabeticalNote } from './Notes'

export interface MidiVisualizerNoteCoordinates extends CanvasRectangle {
    /*
        Some notes don't have associated names because they are just frequencies
        See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
    */
    name?: AlphabeticalNote
    key: number
    velocity: number
    duration: number // milliseconds
    id: string
    channel: number
}
