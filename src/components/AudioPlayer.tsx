import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React from 'react'
import { msToMinAndSec } from '../utils'

interface AudioPlayerProps {
    onChangeMidiTrackCurrentTime: React.Dispatch<React.SetStateAction<number>>
    midiTrackCurrentTime: number
    midiTrackDuration: number
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
}

export function AudioPlayer({
    midiTrackCurrentTime,
    midiTrackDuration,
    isSoundOn,
    toggleSound,
    onChangeMidiTrackCurrentTime,
}: AudioPlayerProps) {
    const currentTime = msToMinAndSec(midiTrackCurrentTime)
    const totalTime = msToMinAndSec(midiTrackDuration)

    return (
        <>
            {currentTime}
            <RangeSlider
                onChange={onChangeMidiTrackCurrentTime}
                value={midiTrackCurrentTime}
                max={midiTrackDuration}
            />
            {totalTime}
            <SoundController isSoundOn={isSoundOn} toggleSound={toggleSound} />
            <PlayerController
                setMidiTrackCurrentTime={onChangeMidiTrackCurrentTime}
                midiTrackDuration={midiTrackDuration}
            />
        </>
    )
}
