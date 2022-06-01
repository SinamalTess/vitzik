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

export interface MidiJsonNote {
    channel: number
    delta: number
    noteOn?: {
        noteNumber: number
        velocity: number
    }
    noteOff?: {
        noteNumber: number
        velocity: number
    }
}

export function midiJsonToNotes(json: MidiJson): MidiJsonNote[] {
    let notesArr: any[] = []

    json.tracks.forEach((track: any) => {
        const notes = track.filter(
            (event: any) =>
                event.hasOwnProperty('noteOn') ||
                event.hasOwnProperty('noteOff')
        )
        if (notes.length) {
            notesArr.push(...notes)
        }
    })

    return notesArr.slice(0, 100)
}
