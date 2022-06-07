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
    const trackPositionDate = new Date(trackPosition)
    const currentTime = trackPositionDate.getMinutes() + ':' + trackPositionDate.getSeconds()
    const midiTrackDurationDate = new Date(midiTrackDuration)
    const totalTime = midiTrackDurationDate.getMinutes() + ':' + midiTrackDurationDate.getSeconds()

    return (
        <>
            {currentTime}
            <RangeSlider
                setValue={setTrackPosition}
                value={trackPosition}
                max={midiTrackDuration}
            />
            {totalTime}
            <SoundController isSoundOn={isSoundOn} toggleSound={toggleSound} />
            <PlayerController onPlay={onPlay} />
        </>
    )
}
