import { AlphabeticalNote } from './Notes'

export interface ActiveNote {
    /*
        Some notes don't have associated names because they are just frequencies
        See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
    */
    name?: AlphabeticalNote
    velocity: number
    id?: string
    duration?: number
    key: number
    channel: number
}
