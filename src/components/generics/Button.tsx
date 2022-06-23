import React, { ReactNode } from 'react'
import './Button.scss'
import { Icon, IconName } from './Icon'
import { CSSSpacingSize, CSSColor } from '../../types'

export interface ButtonProps {
    disabled?: boolean
    active?: boolean
    icon?: IconName
    children?: ReactNode
    size?: CSSSpacingSize
    color?: CSSColor
    outline?: boolean
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export function Button({
    disabled = false,
    active = false,
    icon,
    children,
    size = 'md',
    outline = false,
    onClick = () => {},
}: ButtonProps) {
    const className = `btn btn--${size} pd-${size} ${active ? 'btn--active' : ''} ${
        outline ? 'btn--outline' : ''
    }`

    return (
        <button disabled={disabled} className={className} onClick={onClick}>
            {icon ? <Icon name={icon} size={size} /> : null}
            {children}
        </button>
    )
}
