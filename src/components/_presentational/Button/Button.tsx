import React, { ReactNode } from 'react'
import './Button.scss'
import { Icon } from '../Icon'
import { CSSSpacingSize, CSSColor, IconName, PresentationalComponentBasicProps } from '../types'
import clsx from 'clsx'

type ButtonVariant = 'outlined' | 'filled' | 'link'

interface ButtonProps extends PresentationalComponentBasicProps {
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
    style,
    disabled = false,
    active = false,
    icon,
    children,
    size = 'md',
    color = 'primary',
    variant,
    className,
    onClick = () => {},
}: ButtonProps) {
    const classNames = clsx(
        'btn',
        { [`btn-${size}`]: size },
        { [`pd-${size}`]: size },
        { 'btn--active': active },
        { 'btn--outline': variant === 'outlined' },
        { 'btn--link': variant === 'link' },
        { 'btn--disabled': disabled },
        { [`btn--${color}`]: color },
        className
    )

    return (
        <button disabled={disabled} className={classNames} onClick={onClick} style={style}>
            {icon ? <Icon name={icon} size={size} /> : null}
            {children}
        </button>
    )
}
