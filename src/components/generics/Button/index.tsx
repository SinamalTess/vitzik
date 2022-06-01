import React from 'react'
import './button.scss'

export interface ButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
    isDisabled?: boolean
    icon?: 'volume' | null
    children?: string
    size?: 'small' | 'medium' | 'large'
}

export function Button({
    onClick,
    isDisabled = false,
    icon,
    children,
    size = 'medium',
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`btn btn--${size}`}
        >
            <span className={icon ? 'icon icon--' + icon : ''}>{children}</span>
        </button>
    )
}
