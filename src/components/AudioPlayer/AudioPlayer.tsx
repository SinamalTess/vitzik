import React, { useCallback, useEffect, useState } from 'react'
import { AudioPlayerState, MidiMetas, MidiMode } from '../../types'
import './AudioPlayer.scss'
import { LoopTimes } from '../../types/LoopTimes'
import { AudioPlayerKeyboardShortcuts } from './AudioPlayerKeyboardShortcuts'
import { ProgressBar } from './ProgressBar'
import { Controls } from './Controls'

interface AudioPlayerProps {
    worker: Worker
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
    onChangeAudioPlayerTime: React.Dispatch<React.SetStateAction<number>>
    onChangeIsEditingLoop: React.Dispatch<React.SetStateAction<boolean>>
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimes>>
}

const BASE_CLASS = 'audio-player'

export const AudioPlayer = React.memo(function AudioPlayer({
    worker,
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
    onChangeAudioPlayerTime,
    onChangeIsEditingLoop,
    onChangeLoopTimes,
}: AudioPlayerProps) {
    const { midiDuration, allMsPerBeat } = midiMetas
    const isPlaying = audioPlayerState === 'playing'
    const [prevState, setPrevState] = useState<AudioPlayerState>(audioPlayerState)
    const [startLoop, endLoop] = loopTimes

    const checkForEndOfSong = useCallback(
        (time: number) => {
            if (time > midiDuration) {
                onChangeAudioPlayerState('stopped')
            }
        },
        [midiDuration, onChangeAudioPlayerState]
    )

    const checkForEndOfLoop = useCallback(
        (time: number) => {
            // if loops are defined we restart at the beginning of the loop if the end is reached
            if (startLoop && endLoop && time > endLoop) {
                const previousState = audioPlayerState
                onChangeAudioPlayerState('seeking')
                onChangeAudioPlayerTime(startLoop - 100 ?? 0) // starts a bit before the loop start
                /*
                Yeah, this setTimeout() is ugly...but otherwise the state is not restored, and we can't use flushSync here
            */
                setTimeout(() => {
                    onChangeAudioPlayerState(previousState)
                }, 100)
            }
        },
        [audioPlayerState, endLoop, onChangeAudioPlayerState, onChangeAudioPlayerTime, startLoop]
    )

    const checkForWaitMode = useCallback(
        (time: number) => {
            // in `wait` mode we pause until the user hits the right keys
            if (timeToNextNote && time >= timeToNextNote && midiMode === 'wait') {
                onChangeAudioPlayerState('paused')
            }
        },
        [timeToNextNote, midiMode, onChangeAudioPlayerState]
    )

    const workerListener = useCallback(
        (message: MessageEvent) => {
            const { time } = message.data
            checkForEndOfSong(time)
            checkForEndOfLoop(time)
            checkForWaitMode(time)
        },
        [checkForEndOfSong, checkForEndOfLoop, checkForWaitMode]
    )

    useEffect(() => {
        worker.addEventListener('message', workerListener)
        return function cleanup() {
            worker.removeEventListener('message', workerListener)
        }
    }, [worker, workerListener])

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        onChangeAudioPlayerTime(parseFloat(value))
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

    function handleMouseUp(event: React.MouseEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement
        if (parseInt(value) > 0 && prevState === 'stopped') {
            onChangeAudioPlayerState('paused')
        } else {
            onChangeAudioPlayerState(prevState)
        }
    }

    function handleClickOnLoop() {
        onChangeIsEditingLoop((isEditingLoop) => !isEditingLoop)
        if (isEditingLoop) {
            onChangeLoopTimes([null, null]) // clears the loop times
        }
    }

    return (
        <div className={BASE_CLASS}>
            <ProgressBar
                worker={worker}
                midiDuration={midiDuration}
                midiTitle={midiTitle}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
            />
            <Controls
                worker={worker}
                isEditingLoop={isEditingLoop}
                isMute={isMute}
                midiSpeedFactor={midiSpeedFactor}
                audioPlayerState={audioPlayerState}
                allMsPerBeat={allMsPerBeat}
                onMute={onMute}
                onChangeMidiSpeedFactor={onChangeMidiSpeedFactor}
                onClickOnPlay={handleClickOnPlay}
                onClickOnLoop={handleClickOnLoop}
                onStop={handleClickOnStop}
            />
            <AudioPlayerKeyboardShortcuts
                worker={worker}
                audioPlayerState={audioPlayerState}
                onChangeAudioPlayerState={onChangeAudioPlayerState}
                onChangeAudioPlayerTime={onChangeAudioPlayerTime}
            />
        </div>
    )
})
