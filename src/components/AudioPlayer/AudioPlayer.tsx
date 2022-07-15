import { RangeSlider } from '../_presentational/RangeSlider'
import { SoundButton } from '../SoundButton'
import { PlayButton } from '../PlayButton'
import React, { useContext } from 'react'
import { msToMinAndSec, normalizeTitle } from '../../utils'
import { AudioPlayerState, MidiMetas, MidiMode } from '../../types'
import './AudioPlayer.scss'
import { Button } from '../_presentational/Button'
import { Tooltip } from '../_presentational/Tooltip'
import { MidiCurrentTime } from '../TimeContextProvider/TimeContextProvider'
import { BpmSelector } from '../BpmSelector'

interface AudioPlayerProps {
    midiTitle?: string
    midiMetas: MidiMetas
    midiSpeedFactor: number
    midiMode: MidiMode
    isMute: boolean
    isPlaying: boolean
    timeToNextNote: number | null
    onMute: (isMute: boolean) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onChangeMidiStartingTime: React.Dispatch<React.SetStateAction<number>>
    onPlay: React.Dispatch<React.SetStateAction<boolean>>
}

export function AudioPlayer({
    isMute,
    isPlaying,
    midiTitle,
    midiMode,
    midiMetas,
    timeToNextNote,
    midiSpeedFactor,
    onMute,
    onChangeAudioPlayerState,
    onChangeMidiSpeedFactor,
    onChangeMidiStartingTime,
    onPlay,
}: AudioPlayerProps) {
    const midiCurrentTime = useContext(MidiCurrentTime)
    const { midiDuration } = midiMetas
    const currentTime = msToMinAndSec(midiCurrentTime)
    const totalTime = msToMinAndSec(midiDuration)
    const title = normalizeTitle(midiTitle ?? '')

    function stop() {
        onPlay(false)
        onChangeAudioPlayerState('stopped')
        onChangeMidiStartingTime(0)
    }

    function pause() {
        onPlay(false)
        onChangeAudioPlayerState('paused')
        onChangeMidiStartingTime(midiCurrentTime)
    }

    function play() {
        onPlay(true)
        onChangeAudioPlayerState('playing')
    }

    if (midiMode === 'wait') {
        if (!isPlaying) {
            onChangeAudioPlayerState('paused')
        } else {
            onChangeAudioPlayerState('playing')
        }
    }

    // the end of the song
    if (midiCurrentTime > midiDuration) {
        stop()
    }

    // in `wait` mode we pause until the user hits the right keys
    if (timeToNextNote && midiCurrentTime >= timeToNextNote && midiMode === 'wait') {
        pause()
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        onChangeMidiStartingTime(parseFloat(value))
    }

    function handleClickOnPlay() {
        if (!isPlaying) {
            play()
        } else {
            pause()
        }
    }

    function handleClickOnStop() {
        stop()
    }

    function handleMouseDown() {
        onChangeAudioPlayerState('seeking')
    }

    function handleMouseUp() {
        if (!isPlaying) {
            onChangeAudioPlayerState('paused')
        } else {
            onChangeAudioPlayerState('playing')
        }
    }

    return (
        <div className="audio-player">
            <Tooltip showOnHover>
                <span className="audio-player__track-title">{title}</span>
                {title}
            </Tooltip>
            <span className="audio-player__current-time" role="timer">
                {currentTime}
            </span>
            <RangeSlider
                className="audio-player__progress-bar"
                value={midiCurrentTime}
                max={midiDuration}
                onChange={handleChange}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            />
            <span className="audio-player__total-time" role="timer">
                {totalTime}
            </span>
            <Button onClick={handleClickOnStop} icon="stop" variant="link" color="secondary" />
            <PlayButton onClick={handleClickOnPlay} isPlaying={isPlaying} />
            <SoundButton isMute={isMute} onMute={onMute} />
            <BpmSelector
                midiSpeedFactor={midiSpeedFactor}
                onChangeMidiSpeedFactor={onChangeMidiSpeedFactor}
                onChangeMidiStartingTime={onChangeMidiStartingTime}
                midiMetas={midiMetas}
            />
        </div>
    )
}
