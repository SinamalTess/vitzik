import React from 'react'
import './Icon.scss'
import clsx from 'clsx'
import { IconName, CSSSpacingSize } from '../types'

interface IconProps {
    name: IconName
    children?: string
    size?: CSSSpacingSize | number
}

export function Icon({ name, children, size = 'md' }: IconProps) {
    const className = clsx(
        'icon',
        { [`icon-${name}`]: name },
        { [`icon-instrument`]: name.startsWith('instrument') },
        { [`icon-${size}`]: typeof size === 'string' }
    )

    const style = typeof size === 'number' ? { fontSize: size + 'px' } : {}

    return (
        // TODO: check if this is the proper usage of aria-label
        <span className={className} style={style} aria-label={`icon-${name}`}>
            {children}
        </span>
    )
}
