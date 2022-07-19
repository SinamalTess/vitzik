import React, { useCallback, useEffect, useState } from 'react'
import { registerShortcut } from '../../utils/keyboard_shortcuts'
import { AudioPlayerState } from '../../types'

interface AudioPlayerKeyboardShortcutsProps {
    audioPlayerState: AudioPlayerState
    midiCurrentTime: number
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeMidiStartingTime: React.Dispatch<React.SetStateAction<number>>
}

export function AudioPlayerKeyboardShortcuts({
    audioPlayerState,
    midiCurrentTime,
    onChangeMidiStartingTime,
    onChangeAudioPlayerState,
}: AudioPlayerKeyboardShortcutsProps) {
    const [prevState, setPrevState] = useState<AudioPlayerState>(audioPlayerState)

    function onArrowUp() {
        onChangeMidiStartingTime(midiCurrentTime)
        onChangeAudioPlayerState('seeking')
        onChangeMidiStartingTime((midiStartingTime) => {
            return midiStartingTime + 100
        })
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
        const unsubscribe = registerShortcut('Space', onSpace)

        return function cleanup() {
            unsubscribe()
        }
    }, [onSpace])

    return null
}
