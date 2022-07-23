import { Button } from '../_presentational/Button'
import { PlayButton } from '../PlayButton'
import { SoundButton } from '../SoundButton'
import React from 'react'
import { AudioPlayerState } from '../../types'

interface ControlsProps {
    isMute: boolean
    state: AudioPlayerState
    onClickOnPlay: () => void
    onStop: () => void
    onMute: (isMute: boolean) => void
}

export function Controls({ isMute, state, onClickOnPlay, onStop, onMute }: ControlsProps) {
    return (
        <>
            <Button
                onClick={onStop}
                icon="stop"
                variant="link"
                color="secondary"
                aria-label={'stop'}
            />
            <PlayButton onClick={onClickOnPlay} isPlaying={state === 'playing'} />
            <SoundButton isMute={isMute} onMute={onMute} />
        </>
    )
}
