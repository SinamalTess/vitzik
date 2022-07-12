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
    onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
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
        onMouseEnter = () => {},
        onMouseLeave = () => {},
    },
    ref
) {
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
        <button
            ref={ref}
            disabled={disabled}
            className={classNames}
            style={style}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {icon ? <Icon name={icon} size={size} /> : null}
            {children}
        </button>
    )
})
