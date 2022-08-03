import { Button } from '../_presentational/Button'
import { PlayButton } from './PlayButton'
import { SoundButton } from '../SoundButton'
import React from 'react'
import { AudioPlayerState } from '../../types'

interface ControlsProps {
    isMute: boolean
    state: AudioPlayerState
    onPlay: () => void
    onStop: () => void
    onToggleSound: (isMute: boolean) => void
    onPlayButtonBlur?: () => void
    onPlayButtonFocus?: () => void
}

export function Controls({
    isMute,
    state,
    onPlay,
    onStop,
    onToggleSound,
    onPlayButtonBlur,
    onPlayButtonFocus,
}: ControlsProps) {
    return (
        <>
            <Button
                onClick={onStop}
                icon="stop"
                variant="link"
                color="secondary"
                aria-label={'stop'}
            />
            <PlayButton
                onClick={onPlay}
                isPlaying={state === 'playing'}
                onBlur={onPlayButtonBlur}
                onFocus={onPlayButtonFocus}
            />
            <SoundButton isMute={isMute} onToggleSound={onToggleSound} />
        </>
    )
}
