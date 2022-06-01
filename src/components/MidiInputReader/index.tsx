import React from 'react'
import { translateNote } from '../../utils'
import { AlphabeticalNote, MusicSystem } from '../../types'

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
