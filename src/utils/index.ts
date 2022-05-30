import { NOTES } from './const/notes'
import { MusicSystem } from '../types/MusicSystem'
import { AlphabeticalNote, Note } from '../types/Notes'

export function noteKeyToName(key: number): AlphabeticalNote {
    return NOTES.alphabetical[key - 21] // 21 is the offset calculated from : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
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
