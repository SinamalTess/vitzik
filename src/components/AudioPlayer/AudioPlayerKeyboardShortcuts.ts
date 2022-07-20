import React, { useCallback, useEffect, useRef, useState } from 'react'
import { registerShortcut } from '../../utils/keyboard_shortcuts'
import { AudioPlayerState } from '../../types'

interface AudioPlayerKeyboardShortcutsProps {
    worker: Worker
    audioPlayerState: AudioPlayerState
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeAudioPlayerTime: React.Dispatch<React.SetStateAction<number>>
}

export function AudioPlayerKeyboardShortcuts({
    worker,
    audioPlayerState,
    onChangeAudioPlayerTime,
    onChangeAudioPlayerState,
}: AudioPlayerKeyboardShortcutsProps) {
    const [prevState, setPrevState] = useState<AudioPlayerState>(audioPlayerState)
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
        onChangeAudioPlayerTime(midiCurrentTime.current)
        onChangeAudioPlayerState('seeking')
        onChangeAudioPlayerTime((midiStartingTime) => {
            return Math.max(0, midiStartingTime + value) // can't seek below 0
        })
    }

    function onArrowUp() {
        seekFor(100)
    }

    function onArrowDown() {
        seekFor(-100)
    }

    function restoreAudioPlayerPreviousState() {
        onChangeAudioPlayerState(prevState === 'stopped' ? 'paused' : prevState)
    }

    const onSpace = useCallback(() => {
        onChangeAudioPlayerState((audioPlayerState) => {
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
    }, [onChangeAudioPlayerState])

    useEffect(() => {
        if (audioPlayerState !== 'seeking') {
            setPrevState(audioPlayerState)
        }

        const restoreAudioPlayerPreviousState = () =>
            onChangeAudioPlayerState(prevState === 'stopped' ? 'paused' : prevState)

        const unsubscribe = registerShortcut('ArrowUp', onArrowUp, restoreAudioPlayerPreviousState)

        return function cleanup() {
            unsubscribe()
        }
    }, [onArrowUp])

    useEffect(() => {
        if (audioPlayerState !== 'seeking') {
            setPrevState(audioPlayerState)
        }
        const unsubscribe = registerShortcut(
            'ArrowDown',
            onArrowDown,
            restoreAudioPlayerPreviousState
        )

        return function cleanup() {
            unsubscribe()
        }
    }, [onArrowDown])

    useEffect(() => {
        const unsubscribe = registerShortcut('Space', onSpace)

        return function cleanup() {
            unsubscribe()
        }
    }, [onSpace])

    return null
}
