import React from 'react'
// @ts-ignore
import { Button, Tooltip, CSSSpacingSize } from 'vitzik-ui'
import './VolumeButton.scss'
import clsx from 'clsx'

interface VolumeButtonProps {
    size?: CSSSpacingSize
    isMute: boolean
    onToggleSound: (isMute: boolean) => void
}

const BASE_CLASS = 'volume-icon'

export function VolumeButton({ size, isMute, onToggleSound }: VolumeButtonProps) {
    function handleClick() {
        onToggleSound(!isMute)
    }

    const classNames = clsx(BASE_CLASS, { [`${BASE_CLASS}--active`]: isMute })

    return (
        <Tooltip showOnHover>
            <Button
                onClick={handleClick}
                variant="text"
                className={classNames}
                aria-label={isMute ? 'muted' : 'volume'}
                size={size}
            >
                <svg viewBox="0 0 108 96" aria-hidden="true">
                    <path d="M7 28h28L59 8v80L35 68H7a4 4 0 01-4-4V32a4 4 0 014-4z" />
                    <path d="M79 62c4-4.667 6-9.333 6-14s-2-9.333-6-14L49 3" />
                    <path d="M95 69c6.667-7.333 10-14.667 10-22s-3.333-14.667-10-22L75.5 6 49 33" />
                </svg>
            </Button>
            {`${isMute ? 'Unmute' : 'Mute'} (m)`}
        </Tooltip>
    )
}
