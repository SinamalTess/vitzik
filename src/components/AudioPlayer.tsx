import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React from 'react'

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
    const trackPositionDate = new Date(trackPosition)
    const currentTime = trackPositionDate.getMinutes() + ':' + trackPositionDate.getSeconds()
    const midiTrackDurationDate = new Date(midiTrackDuration)
    const totalTime = midiTrackDurationDate.getMinutes() + ':' + midiTrackDurationDate.getSeconds()

    function handlePlay() {
        if (midiTrackDuration) {
            const play = setInterval(() => {
                setTrackPosition((trackPosition: number) => {
                    if (trackPosition >= midiTrackDuration) {
                        clearInterval(play)
                    }
                    return trackPosition + 10
                })
            }, 10)
        }
    }

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
            <PlayerController onPlay={handlePlay} />
        </>
    )
}
