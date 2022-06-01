import React from 'react'
import { CSSSize } from '../../../types/CSSSize'

export type IconName = 'volume' | 'frequency' | 'infos'

interface IconProps {
    name: IconName
    children?: string
    size?: CSSSize
}

export function Icon({ name, children, size = 'md' }: IconProps) {
    const className = `icon icon--${name} icon--${size}`
    return <span className={className}>{children}</span>
}
