import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayerController } from './PlayerController'
import React from 'react'
import { msToMinAndSec } from '../utils'

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

    function handleChange(midiTrackNextTime: number) {
        if (midiTrackNextTime < midiTrackCurrentTime) {
            handleRewind(midiTrackNextTime)
        } else {
            handleSeeking(midiTrackNextTime)
        }
    }

    function handleRewind(midiTrackCurrentTime: number) {
        onChangeAudioPlayerState('rewinding')
        onChangeMidiTrackCurrentTime(midiTrackCurrentTime)
    }

    function handlePlay() {
        onChangeAudioPlayerState('playing')
        return onChangeMidiTrackCurrentTime
    }

    function handlePause() {
        onChangeAudioPlayerState('paused')
    }

    function handleSeeking(midiTrackCurrentTime: number) {
        onChangeAudioPlayerState('seeking')
        onChangeMidiTrackCurrentTime(midiTrackCurrentTime)
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
