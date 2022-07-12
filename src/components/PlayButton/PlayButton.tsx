import React from 'react'
import { Button } from '../_presentational/Button'
import './PlayButton.scss'
import clsx from 'clsx'

interface PlayerControllerProps {
    isPlaying: boolean
    onClick: () => void
}

export function PlayButton({ onClick, isPlaying }: PlayerControllerProps) {
    const classNames = clsx('play-button', {
        [`play-button--playing`]: isPlaying,
    })

    return (
        <Button onClick={onClick} variant={'link'}>
            <span className={classNames}>
                <span className="play-button__half play-button__half--before"></span>
                <span className="play-button__half play-button__half--after"></span>
            </span>
        </Button>
    )
}
