import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React from 'react'

interface AudioPlayerProps {
    setTrackPosition: (position: number) => void
    trackPosition: number
    midiTrackDuration: number
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
    onPlay: () => void
}

export function AudioPlayer({
    setTrackPosition,
    trackPosition,
    midiTrackDuration,
    isSoundOn,
    toggleSound,
    onPlay,
}: AudioPlayerProps) {
    const trackPositionInDate = new Date(trackPosition)

    return (
        <>
            <RangeSlider
                setValue={setTrackPosition}
                value={trackPosition}
                max={midiTrackDuration}
            />
            {`${trackPositionInDate.getMinutes()}:${trackPositionInDate.getSeconds()}`}

            <SoundController isSoundOn={isSoundOn} toggleSound={toggleSound} />
            <PlayerController onPlay={onPlay} />
        </>
    )
}
