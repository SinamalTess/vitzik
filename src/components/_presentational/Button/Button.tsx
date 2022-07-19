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

const BASE_CLASS = 'btn'

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        style,
        'aria-label': ariaLabel,
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
        BASE_CLASS,
        { [`${BASE_CLASS}-${size}`]: size },
        { [`pd-${size}`]: size },
        { [`${BASE_CLASS}--active`]: active },
        { [`${BASE_CLASS}--outline`]: variant === 'outlined' },
        { [`${BASE_CLASS}--link`]: variant === 'link' },
        { [`${BASE_CLASS}--disabled`]: disabled },
        { [`${BASE_CLASS}--${color}`]: color },
        className
    )

    return (
        <button
            ref={ref}
            disabled={disabled}
            className={classNames}
            style={style}
            aria-label={ariaLabel}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
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
