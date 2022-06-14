import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React, { useEffect } from 'react'
import { msToMinAndSec } from '../utils'
import { usePrevious } from '../hooks'

export type AudioPlayerState = 'pending' | 'playing' | 'rewinding' | 'paused' | 'seeking'

interface AudioPlayerProps {
    midiTrackCurrentTime: number
    midiTrackDuration: number
    isMute: boolean
    toggleSound: (isSoundOn: boolean) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeMidiTrackCurrentTime: (midiTrackCurrentTime: number) => void
}

export function AudioPlayer({
    midiTrackCurrentTime,
    midiTrackDuration,
    isMute,
    toggleSound,
    onChangeAudioPlayerState,
    onChangeMidiTrackCurrentTime,
}: AudioPlayerProps) {
    const currentTime = msToMinAndSec(midiTrackCurrentTime)
    const totalTime = msToMinAndSec(midiTrackDuration)
    const prevMidiTrackCurrentTime = usePrevious(midiTrackCurrentTime) ?? 0

    useEffect(() => {
        if (midiTrackCurrentTime <= prevMidiTrackCurrentTime) {
            onChangeAudioPlayerState('rewinding')
        } else {
            onChangeAudioPlayerState('seeking')
        }
    }, [midiTrackCurrentTime])

    function handleChange(midiTrackCurrentTime: number) {
        onChangeMidiTrackCurrentTime(midiTrackCurrentTime)
    }

    function handlePlay() {
        onChangeAudioPlayerState('playing')
        return onChangeMidiTrackCurrentTime
    }

    function handlePause() {
        onChangeAudioPlayerState('paused')
    }

    return (
        <div className="audioplayer">
            {currentTime}
            <RangeSlider
                value={midiTrackCurrentTime}
                max={midiTrackDuration}
                onChange={handleChange}
            />
            {totalTime}
            <SoundController isMute={isMute} toggleSound={toggleSound} />
            <PlayerController
                onPlay={handlePlay}
                midiTrackDuration={midiTrackDuration}
                onPause={handlePause}
            />
        </div>
    )
}
