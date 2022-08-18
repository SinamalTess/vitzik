import React from 'react'
import { Button, CSSSpacingSize, Tooltip } from 'vitzik-ui'
import './PlayButton.scss'
import clsx from 'clsx'

interface PlayerControllerProps {
    size?: CSSSpacingSize
    isPlaying: boolean
    onClick: () => void
    onFocus?: () => void
    onBlur?: () => void
}

const BASE_CLASS = 'play-button'

export function PlayButton({ size, isPlaying, onClick, onBlur, onFocus }: PlayerControllerProps) {
    const classNames = clsx(BASE_CLASS, {
        [`${BASE_CLASS}--pause`]: isPlaying,
    })

    return (
        <Tooltip showOnHover>
            <Button
                onClick={onClick}
                variant={'text'}
                aria-label={isPlaying ? 'play' : 'paused'}
                size={size}
                onBlur={onBlur}
                onFocus={onFocus}
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
