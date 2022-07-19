import React, { useContext, useState } from 'react'
import { AudioPlayerState, MidiMetas, MidiMode } from '../../types'
import './AudioPlayer.scss'
import { MidiCurrentTime } from '../TimeContextProvider/TimeContextProvider'
import { LoopTimes } from '../../types/LoopTimes'
import { AudioPlayerKeyboardShortcuts } from './AudioPlayerKeyboardShortcuts'
import { ProgressBar } from './ProgressBar'
import { Controls } from './Controls'

interface AudioPlayerProps {
    audioPlayerState: AudioPlayerState
    midiTitle?: string
    midiMetas: MidiMetas
    midiSpeedFactor: number
    midiMode: MidiMode
    isMute: boolean
    loopTimes: LoopTimes
    isEditingLoop: boolean
    timeToNextNote: number | null
    onMute: (isMute: boolean) => void
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onChangeMidiStartingTime: React.Dispatch<React.SetStateAction<number>>
    onChangeIsEditingLoop: React.Dispatch<React.SetStateAction<boolean>>
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimes>>
}

const BASE_CLASS = 'audio-player'

export function AudioPlayer({
    audioPlayerState,
    isEditingLoop,
    isMute,
    loopTimes,
    midiTitle,
    midiMode,
    midiMetas,
    timeToNextNote,
    midiSpeedFactor,
    onMute,
    onChangeAudioPlayerState,
    onChangeMidiSpeedFactor,
    onChangeMidiStartingTime,
    onChangeIsEditingLoop,
    onChangeLoopTimes,
}: AudioPlayerProps) {
    const midiCurrentTime = useContext(MidiCurrentTime)
    const { midiDuration } = midiMetas
    const isPlaying = audioPlayerState === 'playing'
    const [prevState, setPrevState] = useState<AudioPlayerState>(audioPlayerState)
    const [startLoop, endLoop] = loopTimes

    switch (audioPlayerState) {
        case 'paused':
            onChangeMidiStartingTime(midiCurrentTime)
            break
        case 'stopped':
            onChangeMidiStartingTime(0)
            break
        default:
    }

    // the end of the song
    if (midiCurrentTime > midiDuration) {
        onChangeAudioPlayerState('stopped')
    }

    if (startLoop && endLoop && midiCurrentTime > endLoop) {
        const previousState = audioPlayerState
        onChangeAudioPlayerState('seeking')
        onChangeMidiStartingTime(startLoop - 100 ?? 0)
        setTimeout(() => {
            onChangeAudioPlayerState(previousState)
        }, 100)
    }

    // in `wait` mode we pause until the user hits the right keys
    if (timeToNextNote && midiCurrentTime >= timeToNextNote && midiMode === 'wait') {
        onChangeAudioPlayerState('paused')
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        onChangeMidiStartingTime(parseFloat(value))
    }

    function handleClickOnPlay() {
        onChangeAudioPlayerState(isPlaying ? 'paused' : 'playing')
    }

    function handleClickOnStop() {
        onChangeAudioPlayerState('stopped')
    }

    function handleMouseDown() {
        setPrevState(audioPlayerState)
        onChangeAudioPlayerState('seeking')
    }

    function handleMouseUp() {
        onChangeAudioPlayerState(prevState)
    }

    function handleClickOnLoop() {
        onChangeIsEditingLoop((isEditingLoop) => !isEditingLoop)
        if (isEditingLoop) {
            onChangeLoopTimes([null, null])
        }
    }

    return (
        <div className={BASE_CLASS}>
            <ProgressBar
                midiDuration={midiDuration}
                midiTitle={midiTitle}
                onChange={handleChange}
                onMouseUp={handleMouseDown}
                onMouseDown={handleMouseUp}
            />
            <Controls
                isEditingLoop={isEditingLoop}
                isMute={isMute}
                midiSpeedFactor={midiSpeedFactor}
                audioPlayerState={audioPlayerState}
                midiMetas={midiMetas}
                onMute={onMute}
                onChangeMidiStartingTime={onChangeMidiStartingTime}
                onChangeMidiSpeedFactor={onChangeMidiSpeedFactor}
                onClickOnPlay={handleClickOnPlay}
                onClickOnLoop={handleClickOnLoop}
                onStop={handleClickOnStop}
            />
            <AudioPlayerKeyboardShortcuts
                audioPlayerState={audioPlayerState}
                onChangeAudioPlayerState={onChangeAudioPlayerState}
                onChangeMidiStartingTime={onChangeMidiStartingTime}
            />
        </div>
    )
}
