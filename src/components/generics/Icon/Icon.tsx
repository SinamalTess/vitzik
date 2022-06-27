import React from 'react'
import { CSSSpacingSize } from '../../../types'
import './Icon.scss'
import clsx from 'clsx'
import { IconName } from '../types'

interface IconProps {
    name: IconName
    children?: string
    size?: CSSSpacingSize | number
}

export function Icon({ name, children, size = 'md' }: IconProps) {
    const className = clsx(
        'icon',
        { [`icon-${name}`]: name },
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
