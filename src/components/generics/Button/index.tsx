import React from 'react'
import './button.scss'
import { Icon, IconName } from '../Icon'
import { CSSSize, CSSColor } from '../../../types'

export interface ButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    disable?: boolean
    active?: boolean
    icon?: IconName
    children?: string
    size?: CSSSize
    color?: CSSColor
    outline?: boolean
}

export function Button({
    onClick,
    disable = false,
    active = false,
    icon,
    children,
    size = 'md',
    outline = false,
}: ButtonProps) {
    const className = `btn btn--${size} pd-${size} ${active ? 'btn--active' : ''} ${
        outline ? 'btn--outline' : ''
    }`

    return (
        <button onClick={onClick} disabled={disable} className={className}>
            {icon ? <Icon name={icon} size={size} /> : null}
            {children}
        </button>
    )
}
