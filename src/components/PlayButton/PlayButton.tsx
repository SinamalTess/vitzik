import React from 'react'
import { Button } from '../_presentational/Button'
import './PlayButton.scss'
import clsx from 'clsx'

interface PlayerControllerProps {
    isPlaying: boolean
    onClick: () => void
}

const BASE_CLASS = 'play-button'

export function PlayButton({ onClick, isPlaying }: PlayerControllerProps) {
    const classNames = clsx(BASE_CLASS, {
        [`${BASE_CLASS}--pause`]: isPlaying,
    })

    return (
        <Button
            onClick={onClick}
            variant={'link'}
            aria-label={isPlaying ? 'play button' : 'paused button'}
        >
            <span className={classNames} aria-hidden="true">
                <span className={`${BASE_CLASS}__half ${BASE_CLASS}__half--before`}></span>
                <span className={`${BASE_CLASS}__half ${BASE_CLASS}__half--after`}></span>
            </span>
        </Button>
    )
}
