import React from 'react'
import { CSSSize } from '../../../types'
import './icon.scss'

export type IconName = 'volume' | 'frequency' | 'infos' | 'midi'

interface IconProps {
    name: IconName
    children?: string
    size?: CSSSize | number
}

export function Icon({ name, children, size = 'md' }: IconProps) {
    const sizeClass = typeof size === 'string' ? `icon-${size}` : ''
    const className = `icon icon-${name} ${sizeClass}`
    const style = typeof size === 'number' ? { fontSize: size + 'px' } : {}

    return (
        <span className={className} style={style}>
            {children}
        </span>
    )
}
