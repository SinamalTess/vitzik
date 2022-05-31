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

export function midiJsonToNotes(json: MidiJson) {
    json.tracks.forEach((track) => {
        const notes = track.filter(
            (event) =>
                event.hasOwnProperty('noteOn') ||
                event.hasOwnProperty('noteOff')
        )
        const first10notes = notes.slice(0, 10)
        console.log(first10notes)
        return first10notes
    })
}
