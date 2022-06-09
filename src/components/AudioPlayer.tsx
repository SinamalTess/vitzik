import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React from 'react'
import { msToMinAndSec } from '../utils'

interface AudioPlayerProps {
    setTrackPosition: React.Dispatch<React.SetStateAction<number>>
    trackPosition: number
    midiTrackDuration: number
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
}

export function AudioPlayer({
    setTrackPosition,
    trackPosition,
    midiTrackDuration,
    isSoundOn,
    toggleSound,
}: AudioPlayerProps) {
    const currentTime = msToMinAndSec(trackPosition)
    const totalTime = msToMinAndSec(midiTrackDuration)

    return (
        <>
            {currentTime}
            <RangeSlider
                onChange={setTrackPosition}
                value={trackPosition}
                max={midiTrackDuration}
            />
            {totalTime}
            <SoundController isSoundOn={isSoundOn} toggleSound={toggleSound} />
            <PlayerController
                setTrackPosition={setTrackPosition}
                midiTrackDuration={midiTrackDuration}
            />
        </>
    )
}
