import React, { useContext, useEffect, useRef, useState } from 'react'
import { AudioPlayerState } from '../../types'
import throttle from 'lodash/throttle'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { AppContext } from '../_contexts'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'

interface KeyboardShortcutsProps {
    playerState: AudioPlayerState
    onChangeState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeInitialTime: React.Dispatch<React.SetStateAction<number>>
    onToggleSound: React.Dispatch<React.SetStateAction<boolean>>
}

export function Shortcuts({
    playerState,
    onChangeState,
    onChangeInitialTime,
    onToggleSound,
}: KeyboardShortcutsProps) {
    const [prevState, setPrevState] = useState<AudioPlayerState>(playerState)
    const { shortcuts } = useContext(AppContext)
    const midiCurrentTime = useRef<number>(0)

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        midiCurrentTime.current = time
    }

    useKeyboardShortcut('KeyM', () => onToggleSound((isMute) => !isMute))
    useKeyboardShortcut('Space', onSpaceKey)
    useKeyboardShortcut('ArrowDown', onArrowDownKey, restoreAudioPlayerPreviousState)
    useKeyboardShortcut('ArrowUp', onArrowUpKey, restoreAudioPlayerPreviousState)

    function onSpaceKey() {
        onChangeState((audioPlayerState) => {
            switch (audioPlayerState) {
                case 'stopped':
                    return 'playing'
                case 'paused':
                    return 'playing'
                case 'playing':
                    return 'paused'
                default:
                    return audioPlayerState
            }
        })
    }

    function onArrowDownKey() {
        seekFor(-100)
    }

    function onArrowUpKey() {
        seekFor(100)
    }

    function seekFor(ms: number) {
        onChangeInitialTime(midiCurrentTime.current)
        onChangeState('seeking')
        onChangeInitialTime((midiStartingTime) => {
            return Math.max(0, midiStartingTime + ms) // can't seek below 0
        })
    }

    useEffect(() => {
        if (playerState !== 'seeking') {
            setPrevState(playerState)
        }
    }, [onArrowDownKey, onArrowUpKey])

    function restoreAudioPlayerPreviousState() {
        onChangeState(prevState === 'stopped' ? 'paused' : prevState)
    }

    useEffect(() => {
        const onScroll = throttle((e: WheelEvent) => {
            const FACTOR = 20
            const { deltaY } = e
            seekFor(deltaY * FACTOR)
        }, 100)

        if (shortcuts.includes('wheel')) {
            document.addEventListener('wheel', onScroll)
        } else {
            document.removeEventListener('wheel', onScroll)
        }

        return function cleanup() {
            document.removeEventListener('wheel', onScroll)
        }
    }, [shortcuts])

    return null
}
