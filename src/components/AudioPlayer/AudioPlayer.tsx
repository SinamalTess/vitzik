import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AudioPlayerState, MidiMetas } from '../../types'
import './AudioPlayer.scss'
import { LoopTimes } from '../../types/LoopTimes'
import { ProgressBar } from './ProgressBar'
import { Controls } from './Controls'
import { IntervalWorkerManager } from './IntervalWorkerManager'
import { ShortcutsContext } from '../ShortcutsContext'
import { Shortcuts } from './Shortcuts'

interface AudioPlayerProps {
    worker: Worker
    midiMetas: MidiMetas
    midiSpeedFactor?: number
    state: AudioPlayerState
    title?: string
    duration: number
    isMute?: boolean
    timeToNextNote?: number | null
    loopTimes?: LoopTimes
    onChangeState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onToggleSound: React.Dispatch<React.SetStateAction<boolean>>
}

const BASE_CLASS = 'audio-player'

export const AudioPlayer = React.memo(function AudioPlayer({
    worker,
    midiMetas,
    midiSpeedFactor = 1,
    state = 'stopped',
    isMute = false,
    loopTimes = [null, null],
    title,
    duration,
    timeToNextNote = null,
    onToggleSound,
    onChangeState,
}: AudioPlayerProps) {
    const isPlaying = state === 'playing'
    const [startLoop, endLoop] = loopTimes
    const [prevState, setPrevState] = useState<AudioPlayerState>(state)
    const { shortcuts, setShortcuts } = useContext(ShortcutsContext)
    const [workerInitialTime, setWorkerInitialTime] = useState<number>(0)

    const checkIsEnd = useCallback(
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
                const previousState = state
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
        [state, endLoop, onChangeState, startLoop]
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
        (message: MessageEvent) => {
            const { time } = message.data
            checkIsEnd(time)
            checkIsEndOfLoop(time)
            checkForWaitMode(time)
        },
        [checkIsEnd, checkIsEndOfLoop, checkForWaitMode]
    )

    useEffect(() => {
        worker.addEventListener('message', workerListener)
        return function cleanup() {
            worker.removeEventListener('message', workerListener)
        }
    }, [worker, workerListener])

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        setWorkerInitialTime(parseFloat(value))
    }

    function handleOnPlay() {
        onChangeState(isPlaying ? 'paused' : 'playing')
    }

    function handleOnStop() {
        onChangeState('stopped')
    }

    function handleMouseDown() {
        setPrevState(state)
        onChangeState('seeking')
    }

    function handleMouseUp(event: React.MouseEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement
        if (parseInt(value) > 0 && prevState === 'stopped') {
            onChangeState('paused')
        } else {
            onChangeState(prevState)
        }
    }

    function handlePlayBlur() {
        setShortcuts((shortcuts) => [...shortcuts, 'Space'])
    }

    function handlePlayFocus() {
        setShortcuts((shortcuts) =>
            shortcuts.filter((activeShortcut) => activeShortcut !== 'Space')
        )
    }

    return (
        <div className={BASE_CLASS}>
            <IntervalWorkerManager
                worker={worker}
                midiMetas={midiMetas}
                startAt={workerInitialTime}
                state={state}
                midiSpeedFactor={midiSpeedFactor}
            />
            <ProgressBar
                loopTimes={loopTimes}
                worker={worker}
                duration={duration}
                title={title}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
            />
            <Controls
                isMute={isMute}
                state={state}
                onToggleSound={onToggleSound}
                onStop={handleOnStop}
                onPlay={handleOnPlay}
                onPlayButtonBlur={handlePlayBlur}
                onPlayButtonFocus={handlePlayFocus}
            />
            <Shortcuts
                worker={worker}
                state={state}
                onChangeState={onChangeState}
                onChangeInitialTime={setWorkerInitialTime}
                onToggleSound={onToggleSound}
            />
        </div>
    )
})
