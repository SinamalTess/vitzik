import { NOTES, MIDI_PIANO_KEYS_OFFSET } from './const'
import { AlphabeticalNote, Note, MusicSystem, MidiJsonNote } from '../types'
import { IMidiFile } from 'midi-json-parser-worker'

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

export function midiJsonToNotes(json: IMidiFile): MidiJsonNote[] {
    let notesArr: any[] = []

    json.tracks.forEach((track: any) => {
        const notes = track.filter(
            (event: any) => event.hasOwnProperty('noteOn') || event.hasOwnProperty('noteOff')
        )
        if (notes.length) {
            notesArr.push(...notes)
        }
    })

    return notesArr
}

export function isSpecialKey(note: AlphabeticalNote) {
    return note.includes('C') || note.includes('F')
}

export function getRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)]
}
