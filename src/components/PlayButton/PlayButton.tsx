import React from 'react'
import { Button } from '../_presentational/Button'
import './PlayButton.scss'
import clsx from 'clsx'
import { CSSSpacingSize } from '../_presentational/types'
import { Tooltip } from '../_presentational/Tooltip'

interface PlayerControllerProps {
    size?: CSSSpacingSize
    isPlaying: boolean
    onClick: () => void
}

const BASE_CLASS = 'play-button'

export function PlayButton({ size, isPlaying, onClick }: PlayerControllerProps) {
    const classNames = clsx(BASE_CLASS, {
        [`${BASE_CLASS}--pause`]: isPlaying,
    })

    return (
        <Tooltip showOnHover>
            <Button
                onClick={onClick}
                variant={'link'}
                aria-label={isPlaying ? 'play' : 'paused'}
                size={size}
            >
                <span className={classNames} aria-hidden="true">
                    <span className={`${BASE_CLASS}__half ${BASE_CLASS}__half--before`}></span>
                    <span className={`${BASE_CLASS}__half ${BASE_CLASS}__half--after`}></span>
                </span>
            </Button>
            {`${isPlaying ? 'Pause' : 'Play'} (space)`}
        </Tooltip>
    )
}
