import React, { useContext, useState } from 'react'
import { AudioPlayerState, MidiMetas, LoopTimestamps } from '../../types'
import './AudioPlayer.scss'
import { ProgressBar } from './ProgressBar'
import { Controls } from './Controls'
import { IntervalWorkerManager } from './IntervalWorkerManager'
import { AppContext } from '../_contexts'
import { Shortcuts } from './Shortcuts'
import { useIntervalWorker } from '../../hooks'

interface AudioPlayerProps {
    midiMetas: MidiMetas
    midiSpeedFactor?: number
    playerState: AudioPlayerState
    title?: string
    duration: number
    isMute?: boolean
    loopTimes?: LoopTimestamps
    onChangeState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onToggleSound: React.Dispatch<React.SetStateAction<boolean>>
}

const BASE_CLASS = 'audio-player'

export function AudioPlayer({
    midiMetas,
    midiSpeedFactor = 1,
    playerState = 'stopped',
    isMute = false,
    loopTimes = [null, null],
    title,
    duration,
    onToggleSound,
    onChangeState,
}: AudioPlayerProps) {
    const isPlaying = playerState === 'playing'
    const [prevPlayerState, setPrevPlayerState] = useState<AudioPlayerState>(playerState)
    const [workerInitialTime, setWorkerInitialTime] = useState<number>(0)
    const { setKeyboardShortcuts } = useContext(AppContext)

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        checkIsEndOfSong(time)
    }

    function checkIsEndOfSong(time: number) {
        if (time > midiMetas.midiDuration) {
            onChangeState('stopped')
        }
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        setWorkerInitialTime(parseFloat(value))
    }

    function handleMouseUp(event: React.MouseEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement
        if (parseInt(value) > 0 && prevPlayerState === 'stopped') {
            onChangeState('paused')
        } else {
            onChangeState(prevPlayerState)
        }
    }

    function handleMouseDown() {
        setPrevPlayerState(playerState)
        onChangeState('seeking')
    }

    function handlePlay() {
        onChangeState(isPlaying ? 'paused' : 'playing')
    }

    function handleStop() {
        onChangeState('stopped')
    }

    function handlePlayButtonBlur() {
        setKeyboardShortcuts((shortcuts) => [...shortcuts, 'Space'])
    }

    function handlePlayButtonFocus() {
        setKeyboardShortcuts((shortcuts) =>
            shortcuts.filter((activeShortcut) => activeShortcut !== 'Space')
        )
    }

    return (
        <div className={BASE_CLASS}>
            <IntervalWorkerManager
                midiMetas={midiMetas}
                startAt={workerInitialTime}
                playerState={playerState}
                midiSpeedFactor={midiSpeedFactor}
            />
            <ProgressBar
                loopTimestamps={loopTimes}
                duration={duration}
                title={title}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
            />
            <Controls
                isMute={isMute}
                playerState={playerState}
                onToggleSound={onToggleSound}
                onStop={handleStop}
                onPlay={handlePlay}
                onPlayButtonBlur={handlePlayButtonBlur}
                onPlayButtonFocus={handlePlayButtonFocus}
            />
            <Shortcuts
                playerState={playerState}
                onChangeState={onChangeState}
                onChangeInitialTime={setWorkerInitialTime}
                onToggleSound={onToggleSound}
            />
        </div>
    )
}
