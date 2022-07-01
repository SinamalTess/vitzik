import React, { ReactNode } from 'react'
import './Button.scss'
import { Icon } from '../Icon'
import { CSSSpacingSize, CSSColor, IconName } from '../types'
import clsx from 'clsx'

type ButtonVariant = 'outlined' | 'filled' | 'link'

interface ButtonProps {
    disabled?: boolean
    active?: boolean
    icon?: IconName
    children?: ReactNode
    size?: CSSSpacingSize
    color?: CSSColor
    variant?: ButtonVariant
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export function Button({
    disabled = false,
    active = false,
    icon,
    children,
    size = 'md',
    variant,
    onClick = () => {},
}: ButtonProps) {
    const className = clsx(
        'btn',
        { [`btn--${size}`]: size },
        { [`pd-${size}`]: size },
        { 'btn--active': active },
        { 'btn--outline': variant === 'outlined' },
        { 'btn--link': variant === 'link' }
    )

    return (
        <button disabled={disabled} className={className} onClick={onClick}>
            {icon ? <Icon name={icon} size={size} /> : null}
            {children}
        </button>
    )
}
