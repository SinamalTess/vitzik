import React, { ReactNode } from 'react'
import './Button.scss'
import { Icon } from '../Icon'
import { CSSSpacingSize, CSSColor, IconName, PresentationalComponentBasicProps } from '../../types'
import clsx from 'clsx'

type ButtonVariant = 'outlined' | 'filled' | 'text'

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
    onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void
}

const BASE_CLASS = 'btn'

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        style,
        'aria-label': ariaLabel,
        role,
        disabled = false,
        active = false,
        icon,
        children,
        size = 'md',
        color = 'primary',
        variant = 'filled',
        className,
        onClick = () => {},
        onMouseEnter = () => {},
        onMouseLeave = () => {},
        onBlur = () => {},
        onFocus = () => {},
    },
    ref
) {
    const classNames = clsx(
        BASE_CLASS,
        { [`${BASE_CLASS}-${size}`]: size },
        { [`pd-${size}`]: size },
        { [`${BASE_CLASS}--active`]: active },
        { [`${BASE_CLASS}--${variant}`]: variant },
        { [`${BASE_CLASS}--disabled`]: disabled },
        { [`${BASE_CLASS}--${variant}--${color}`]: color },
        className
    )

    return (
        <button
            role={role}
            ref={ref}
            disabled={disabled}
            className={classNames}
            style={style}
            aria-label={ariaLabel}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            {icon ? (
                <Icon
                    name={icon}
                    size={size}
                    className={clsx({ [`pd-r-${size}`]: size && children })}
                />
            ) : null}
            {children}
        </button>
    )
})
