import React, { ReactNode } from 'react'
import './Button.scss'
import { Icon, IconName } from './Icon'
import { CSSSpacingSize, CSSColor } from '../../types'
import clsx from 'clsx'

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
    const className = clsx(
        'btn',
        { [`btn--${size}`]: size },
        { [`pd-${size}`]: size },
        { 'btn--active': active },
        { 'btn--outline': outline }
    )

    return (
        <button disabled={disabled} className={className} onClick={onClick}>
            {icon ? <Icon name={icon} size={size} /> : null}
            {children}
        </button>
    )
}
