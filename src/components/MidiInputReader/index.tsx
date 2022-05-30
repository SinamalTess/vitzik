import React from 'react'
import { MusicSystem } from '../../types/MusicSystem'
import { translateNote } from '../../utils'
import { AlphabeticalNote, Note } from '../../types/Notes'

interface MidiInputReader {
    notes: AlphabeticalNote[]
    musicSystem: MusicSystem
}

export function MidiInputReader({ notes, musicSystem }: MidiInputReader) {
    return (
        <div>
            {notes.length
                ? notes.map((note) => translateNote(note, musicSystem))
                : 'no note playing'}
        </div>
    )
}
