import React, { useCallback, useEffect, useRef, useState } from 'react'
import { registerShortcut } from '../../utils/keyboard_shortcuts'
import { AudioPlayerState } from '../../types'

interface KeyboardShortcutsProps {
    worker: Worker
    state: AudioPlayerState
    onChangeState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeInitialTime: React.Dispatch<React.SetStateAction<number>>
    onToggleSound: React.Dispatch<React.SetStateAction<boolean>>
}

export function KeyboardShortcuts({
    worker,
    state,
    onChangeState,
    onChangeInitialTime,
    onToggleSound,
}: KeyboardShortcutsProps) {
    const [prevState, setPrevState] = useState<AudioPlayerState>(state)
    const midiCurrentTime = useRef<number>(0)

    useEffect(() => {
        function onTimeUpdate(message: MessageEvent) {
            const { time } = message.data
            midiCurrentTime.current = time
        }

        worker.addEventListener('message', onTimeUpdate)

        return function cleanup() {
            worker.removeEventListener('message', onTimeUpdate)
        }
    }, [worker])

    function seekFor(value: number) {
        onChangeInitialTime(midiCurrentTime.current)
        onChangeState('seeking')
        onChangeInitialTime((midiStartingTime) => {
            return Math.max(0, midiStartingTime + value) // can't seek below 0
        })
    }

    function onArrowUpKey() {
        seekFor(100)
    }

    function onArrowDownKey() {
        seekFor(-100)
    }

    function restoreAudioPlayerPreviousState() {
        onChangeState(prevState === 'stopped' ? 'paused' : prevState)
    }

    const onSpaceKey = useCallback(() => {
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
    }, [onChangeState])

    useEffect(() => {
        if (state !== 'seeking') {
            setPrevState(state)
        }

        const restoreAudioPlayerPreviousState = () =>
            onChangeState(prevState === 'stopped' ? 'paused' : prevState)

        const unsubscribe = registerShortcut(
            'ArrowUp',
            onArrowUpKey,
            restoreAudioPlayerPreviousState
        )

        return function cleanup() {
            unsubscribe()
        }
    }, [onArrowUpKey])

    useEffect(() => {
        if (state !== 'seeking') {
            setPrevState(state)
        }
        const unsubscribe = registerShortcut(
            'ArrowDown',
            onArrowDownKey,
            restoreAudioPlayerPreviousState
        )

        return function cleanup() {
            unsubscribe()
        }
    }, [onArrowDownKey])

    useEffect(() => {
        const unsubscribe = registerShortcut('Space', onSpaceKey)

        return function cleanup() {
            unsubscribe()
        }
    }, [onSpaceKey])

    useEffect(() => {
        const onMKey = () => onToggleSound((isMute) => !isMute)

        const unsubscribe = registerShortcut('KeyM', onMKey)

        return function cleanup() {
            unsubscribe()
        }
    }, [onToggleSound])

    useEffect(() => {
        const onScroll = (e: WheelEvent) => {
            const { deltaY } = e
            seekFor(deltaY)
        }

        document.addEventListener('wheel', onScroll)

        return function cleanup() {
            document.removeEventListener('wheel', onScroll)
        }
    }, [])

    return null
}
