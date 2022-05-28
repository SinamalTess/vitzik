import React from 'react'
import { MusicSystem } from '../../types/musicSystem'
import { translateKey } from '../../utils'

interface MidiInputReader {
    note: string | null
    musicSystem: MusicSystem
}

export function MidiInputReader({ note, musicSystem }: MidiInputReader) {
    return <h1>{note ? translateKey(note, musicSystem) : 'no note playing'}</h1>
}
