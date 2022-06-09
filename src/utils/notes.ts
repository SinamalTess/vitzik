import { AlphabeticalNote, MusicSystem, Note } from '../types'
import { MIDI_PIANO_KEYS_OFFSET, NOTES } from './const'

export const keyToNote = (key: number): AlphabeticalNote =>
    NOTES.alphabetical[key - MIDI_PIANO_KEYS_OFFSET]

export const noteToKey = (note: AlphabeticalNote): number =>
    NOTES.alphabetical.findIndex((currentNote) => currentNote === note) + MIDI_PIANO_KEYS_OFFSET

export const translateNote = (note: Note, musicSystem: MusicSystem): Note => {
    for (const currentMusicSystem in NOTES) {
        const notes = [...NOTES[currentMusicSystem as MusicSystem]]
        const noteIndex = notes.indexOf(note)
        if (noteIndex >= 0) {
            return NOTES[musicSystem][noteIndex]
        }
    }

    return note
}

export const isSpecialKey = (note: AlphabeticalNote) => note.includes('C') || note.includes('F')
