import { Button } from '../_presentational/Button'
import { PlayButton } from './PlayButton'
import { VolumeButton } from '../VolumeButton'
import React from 'react'
import { AudioPlayerState } from '../../types'

interface ControlsProps {
    isMute: boolean
    playerState: AudioPlayerState
    onPlay: () => void
    onStop: () => void
    onToggleSound: (isMute: boolean) => void
    onPlayButtonBlur?: () => void
    onPlayButtonFocus?: () => void
}

export function Controls({
    isMute,
    playerState,
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
                variant="text"
                color="secondary"
                aria-label={'stop'}
            />
            <PlayButton
                onClick={onPlay}
                isPlaying={playerState === 'playing'}
                onBlur={onPlayButtonBlur}
                onFocus={onPlayButtonFocus}
            />
            <VolumeButton isMute={isMute} onToggleSound={onToggleSound} />
        </>
    )
}
