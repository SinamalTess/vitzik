import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React from 'react'
import { msToMinAndSec } from '../utils'

interface AudioPlayerProps {
    midiTrackCurrentTime: number
    midiTrackDuration: number
    isMute: boolean
    toggleSound: (isSoundOn: boolean) => void
    onPlay: (midiTrackCurrentTime: number) => void
    onRewind: (midiTrackCurrentTime: number) => void
    onPause: () => void
}

export function AudioPlayer({
    midiTrackCurrentTime,
    midiTrackDuration,
    isMute,
    toggleSound,
    onPlay,
    onRewind,
    onPause,
}: AudioPlayerProps) {
    const currentTime = msToMinAndSec(midiTrackCurrentTime)
    const totalTime = msToMinAndSec(midiTrackDuration)

    function handleChange(midiTrackNextTime: number) {
        if (midiTrackNextTime < midiTrackCurrentTime) {
            onRewind(midiTrackNextTime)
        } else {
            onPlay(midiTrackNextTime)
        }
    }

    function handlePause() {
        onPause()
    }

    return (
        <>
            {currentTime}
            <RangeSlider
                value={midiTrackCurrentTime}
                max={midiTrackDuration}
                onChange={handleChange}
            />
            {totalTime}
            <SoundController isMute={isMute} toggleSound={toggleSound} />
            <PlayerController
                onPlay={onPlay}
                midiTrackDuration={midiTrackDuration}
                onPause={handlePause}
            />
        </>
    )
}
