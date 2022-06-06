import { AlphabeticalNote, MusicSystem, Note } from '../types'
import { MIDI_PIANO_KEYS_OFFSET, NOTES } from './const'

export function noteKeyToName(key: number): AlphabeticalNote {
    return NOTES.alphabetical[key - MIDI_PIANO_KEYS_OFFSET]
}

export function translateNote(note: Note, musicSystem: MusicSystem): Note {
    for (const currentMusicSystem in NOTES) {
        const notes = [...NOTES[currentMusicSystem as MusicSystem]]
        const noteIndex = notes.indexOf(note)
        if (noteIndex >= 0) {
            return NOTES[musicSystem][noteIndex]
        }
    }

    return note
}

export function isSpecialKey(note: AlphabeticalNote) {
    return note.includes('C') || note.includes('F')
}

export function noteToKey(note: AlphabeticalNote): number {
    return (
        NOTES.alphabetical.findIndex((currentNote) => currentNote === note) + MIDI_PIANO_KEYS_OFFSET
    )
}
