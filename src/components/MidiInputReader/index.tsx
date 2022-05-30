import React from 'react'
import { MusicSystem } from '../../types/musicSystem'
import { translateKey } from '../../utils'

interface MidiInputReader {
    notes: string[]
    musicSystem: MusicSystem
}

export function MidiInputReader({ notes, musicSystem }: MidiInputReader) {
    return (
        <div>
            {notes.length
                ? notes.map((note) => translateKey(note, musicSystem))
                : 'no note playing'}
        </div>
    )
}
