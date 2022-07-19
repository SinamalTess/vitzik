import React, { useCallback, useEffect, useState } from 'react'
import { registerShortcut } from '../../utils/keyboard_shortcuts'
import { AudioPlayerState } from '../../types'

interface AudioPlayerKeyboardShortcutsProps {
    audioPlayerState: AudioPlayerState
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeMidiStartingTime: React.Dispatch<React.SetStateAction<number>>
}

export function AudioPlayerKeyboardShortcuts({
    onChangeMidiStartingTime,
    onChangeAudioPlayerState,
    audioPlayerState,
}: AudioPlayerKeyboardShortcutsProps) {
    const [prevState, setPrevState] = useState<AudioPlayerState>(audioPlayerState)

    function onArrowRight() {
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
        setPrevState(audioPlayerState)
        const unsubscribe = registerShortcut(
            'ArrowRight',
            () => {
                onArrowRight()
            },
            () => onChangeAudioPlayerState(prevState)
        )

        return function cleanup() {
            unsubscribe()
        }
    }, [onArrowRight, audioPlayerState])

    useEffect(() => {
        const unsubscribe = registerShortcut('Space', onSpace)

        return function cleanup() {
            unsubscribe()
        }
    }, [onSpace])

    return null
}
