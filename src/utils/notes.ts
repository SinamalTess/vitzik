import { AlphabeticalNote, MusicSystem, Note } from '../types'
import { MIDI_PIANO_KEYS_OFFSET, NOTE_NAMES } from './const'

export const keyToNote = (key: number): AlphabeticalNote | undefined =>
    NOTE_NAMES.alphabetical[key - MIDI_PIANO_KEYS_OFFSET]

export const noteToKey = (note: AlphabeticalNote): number =>
    NOTE_NAMES.alphabetical.findIndex((currentNote) => currentNote === note) +
    MIDI_PIANO_KEYS_OFFSET

export const translateNoteToMusicSystem = (note: Note, musicSystem: MusicSystem): Note => {
    for (const currentMusicSystem in NOTE_NAMES) {
        const notes = [...NOTE_NAMES[currentMusicSystem as MusicSystem]]
        const noteIndex = notes.indexOf(note)
        if (noteIndex >= 0) {
            return NOTE_NAMES[musicSystem][noteIndex]
        }
    }

    return note
}
