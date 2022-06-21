import React from 'react'
import { Select } from './generics/Select'

interface MidiTrackSelectorProps {
    playableTracksIndexes: number[]
}

export function MidiTrackSelector({ playableTracksIndexes }: MidiTrackSelectorProps) {
    return (
        <Select name={'midi_tracks'} onChange={() => {}}>
            {playableTracksIndexes.map((track) => (
                <option key={track}>{track}</option>
            ))}
        </Select>
    )
}
