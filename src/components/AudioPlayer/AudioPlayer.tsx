import React, { useContext, useState } from 'react'
import { AudioPlayerState, MidiMetas, LoopTimestamps } from '../../types'
import './AudioPlayer.scss'
import { ProgressBar } from './ProgressBar'
import { Controls } from './Controls'
import { IntervalWorkerManager } from './IntervalWorkerManager'
import { AppContext } from '../_contexts'
import { Shortcuts } from './Shortcuts'
import { useIntervalWorker } from '../../_hooks/useIntervalWorker'

interface AudioPlayerProps {
    midiMetas: MidiMetas
    midiSpeedFactor?: number
    playerState: AudioPlayerState
    title?: string
    duration: number
    isMute?: boolean
    timeToNextNote?: number | null
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
    timeToNextNote = null,
    onToggleSound,
    onChangeState,
}: AudioPlayerProps) {
    const isPlaying = playerState === 'playing'
    const [startLoop, endLoop] = loopTimes
    const [prevPlayerState, setPrevPlayerState] = useState<AudioPlayerState>(playerState)
    const [workerInitialTime, setWorkerInitialTime] = useState<number>(0)
    const { setShortcuts } = useContext(AppContext)

    function checkIsEndOfSong(time: number) {
        if (time > duration) {
            onChangeState('stopped')
        }
    }

    function checkIsEndOfLoop(time: number) {
        // if loops are defined we restart at the beginning of the loop if the end is reached
        if (startLoop && endLoop && time > endLoop) {
            // TODO: fix cause this can be 0
            const previousState = playerState
            onChangeState('seeking')
            setWorkerInitialTime(startLoop - 100 ?? 0) // starts a bit before the loop start
            /*
                Yeah, this setTimeout() is ugly...but otherwise the state is not restored, and we can't use flushSync here
            */
            setTimeout(() => {
                onChangeState(previousState)
            }, 100)
        }
    }

    function checkForWaitMode(time: number) {
        // in `wait` mode we pause until the user hits the right keys
        if (timeToNextNote && time >= timeToNextNote) {
            onChangeState('paused')
        }
    }

    function onTimeChange(time: number) {
        checkIsEndOfSong(time)
        checkIsEndOfLoop(time)
        checkForWaitMode(time)
    }

    useIntervalWorker(onTimeChange)

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        setWorkerInitialTime(parseFloat(value))
    }

    function handlePlay() {
        onChangeState(isPlaying ? 'paused' : 'playing')
    }

    function handleStop() {
        onChangeState('stopped')
    }

    function handleMouseDown() {
        setPrevPlayerState(playerState)
        onChangeState('seeking')
    }

    function handleMouseUp(event: React.MouseEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement
        if (parseInt(value) > 0 && prevPlayerState === 'stopped') {
            onChangeState('paused')
        } else {
            onChangeState(prevPlayerState)
        }
    }

    function handlePlayButtonBlur() {
        setShortcuts((shortcuts) => [...shortcuts, 'Space'])
    }

    function handlePlayButtonFocus() {
        setShortcuts((shortcuts) =>
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
