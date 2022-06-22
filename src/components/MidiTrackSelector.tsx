import React from 'react'
import { Select } from './generics/Select'

interface MidiTrackSelectorProps {
    playableTracksIndexes: number[]
    activeTracks: number[]
    onChangeActiveTracks: (activeTracks: number[]) => void
}

export function MidiTrackSelector({
    playableTracksIndexes,
    onChangeActiveTracks,
}: MidiTrackSelectorProps) {
    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const { value } = event.target
        onChangeActiveTracks([parseInt(value)])
    }
    return (
        <Select onChange={handleChange}>
            {playableTracksIndexes.map((track) => (
                <option key={track} value={track}>
                    {track}
                </option>
            ))}
        </Select>
    )
}
