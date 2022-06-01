import { NOTES } from './const/notes'
import { MusicSystem } from '../types'
import { AlphabeticalNote, Note } from '../types'
import { MidiJson, MidiJsonNote } from '../types'
import { MIDI_PIANO_KEYS_OFFSET } from './const/piano_keys'

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
