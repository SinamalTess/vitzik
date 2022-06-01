import React from 'react'
import './button.scss'
import { Icon } from '../Icon'
import { CSSSize } from '../../../types/CSSSize'

export interface ButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
    disable?: boolean
    active?: boolean
    icon?: 'volume' | null
    children?: string
    size?: CSSSize
}

export function Button({
    onClick,
    disable = false,
    active = false,
    icon,
    children,
    size = 'md',
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disable}
            className={`btn btn--${size} padding--${size} margin--${size} ${
                active ? 'active' : ''
            }`}
        >
            {icon ? <Icon name={icon} size={size} /> : null}
            {children}
        </button>
    )
}
