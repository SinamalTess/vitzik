import React from 'react'
import { Button } from '../generics/Button'
import './PlayButton.scss'
import clsx from 'clsx'

interface PlayerControllerProps {
    isPlaying: boolean
    onClick: () => void
}

export function PlayButton({ onClick, isPlaying }: PlayerControllerProps) {
    const className = clsx('play-button-container', {
        [`play-button-container--playing`]: isPlaying,
    })

    return (
        <Button onClick={onClick} variant={'link'}>
            <span className={className}>
                <span className="play-button play-button--before"></span>
                <span className="play-button play-button--after"></span>
            </span>
        </Button>
    )
}
