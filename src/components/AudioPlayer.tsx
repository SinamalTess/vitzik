import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React, { useState } from 'react'

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
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    React.useEffect(() => {
        let timer: NodeJS.Timeout | undefined
        if (isPlaying) {
            timer = setInterval(() => {
                setTrackPosition((trackPosition: number) => {
                    if (trackPosition >= midiTrackDuration) {
                        clearInterval(timer)
                        setIsPlaying(false)
                        return 0
                    }
                    return trackPosition + 10
                })
            }, 10)
        }
        return () => {
            clearInterval(timer)
        }
    }, [isPlaying])

    function onClick() {
        if (midiTrackDuration) {
            setIsPlaying((isPlaying) => !isPlaying)
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
            <PlayerController onClick={onClick} isPlaying={isPlaying} />
        </>
    )
}
