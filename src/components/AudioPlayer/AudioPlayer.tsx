import React, { useCallback, useContext, useState } from 'react'
import { AudioPlayerState, MidiMetas, LoopTimestamps } from '../../types'
import './AudioPlayer.scss'
import { ProgressBar } from './ProgressBar'
import { Controls } from './Controls'
import { IntervalWorkerManager } from './IntervalWorkerManager'
import { ShortcutsContext } from '../ShortcutsContext'
import { Shortcuts } from './Shortcuts'
import { useIntervalWorker } from '../../_hooks/useIntervalWorker'

interface AudioPlayerProps {
    intervalWorker: Worker
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
    intervalWorker,
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
    const { setShortcuts } = useContext(ShortcutsContext)

    const checkIsEndOfSong = useCallback(
        (time: number) => {
            if (time > duration) {
                onChangeState('stopped')
            }
        },
        [duration, onChangeState]
    )

    const checkIsEndOfLoop = useCallback(
        (time: number) => {
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
        },
        [playerState, endLoop, onChangeState, startLoop]
    )

    const checkForWaitMode = useCallback(
        (time: number) => {
            // in `wait` mode we pause until the user hits the right keys
            if (timeToNextNote && time >= timeToNextNote) {
                onChangeState('paused')
            }
        },
        [timeToNextNote, onChangeState]
    )

    const workerListener = useCallback(
        (time: number) => {
            checkIsEndOfSong(time)
            checkIsEndOfLoop(time)
            checkForWaitMode(time)
        },
        [checkIsEndOfSong, checkIsEndOfLoop, checkForWaitMode]
    )

    useIntervalWorker(intervalWorker, workerListener)

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
                intervalWorker={intervalWorker}
                midiMetas={midiMetas}
                startAt={workerInitialTime}
                playerState={playerState}
                midiSpeedFactor={midiSpeedFactor}
            />
            <ProgressBar
                loopTimestamps={loopTimes}
                intervalWorker={intervalWorker}
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
                intervalWorker={intervalWorker}
                playerState={playerState}
                onChangeState={onChangeState}
                onChangeInitialTime={setWorkerInitialTime}
                onToggleSound={onToggleSound}
            />
        </div>
    )
}
