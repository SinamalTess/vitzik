import React from 'react'
import { Dropdown } from './generics/Dropdown'
import { DropdownItem } from './generics/DropdownItem'
import { DropdownToggle } from './generics/DropdownToggle'
import { Checkbox } from './generics/Checkbox'

interface MidiTrackSelectorProps {
    playableTracksIndexes: number[]
    activeTracks: number[]
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
}

export function MidiTrackSelector({
    playableTracksIndexes,
    onChangeActiveTracks,
    activeTracks,
}: MidiTrackSelectorProps) {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        const track = parseInt(value)
        const existingTrackIndex = activeTracks.findIndex((activeTrack) => activeTrack === track)
        if (existingTrackIndex >= 0) {
            const newActiveTracks = [...activeTracks]
            newActiveTracks.splice(existingTrackIndex, 1)
            onChangeActiveTracks(newActiveTracks)
        } else {
            onChangeActiveTracks([...activeTracks, track])
        }
    }

    return (
        <Dropdown>
            <DropdownToggle>Tracks</DropdownToggle>
            {playableTracksIndexes.map((track) => {
                const checked = activeTracks.some((activeTrack) => activeTrack === track)
                return (
                    <DropdownItem key={track}>
                        <Checkbox
                            value={track.toString()}
                            onChange={handleChange}
                            checked={checked}
                        >
                            {track}
                        </Checkbox>
                    </DropdownItem>
                )
            })}
        </Dropdown>
    )
}
