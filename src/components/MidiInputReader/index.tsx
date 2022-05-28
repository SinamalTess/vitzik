import React from 'react'

interface MidiInputReader {
    note: string | null
}

export function MidiInputReader({ note }: MidiInputReader) {
    return <h1>{note ? note : 'no note playing'}</h1>
}
