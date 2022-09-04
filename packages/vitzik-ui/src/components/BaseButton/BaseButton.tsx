import clsx from 'clsx'
import React, { ReactNode } from 'react'
import { CSSSpacingSize, PresentationalComponentBasicProps } from '../../types'

export interface BaseButtonProps extends PresentationalComponentBasicProps {
    children?: ReactNode
    disabled?: boolean
    size?: CSSSpacingSize
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
    onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void
}

export const BASE_CLASS = 'btn'

export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(function BaseButton(
    { children, className, 'aria-label': ariaLabel, disabled = false, ...rest }: BaseButtonProps,
    ref
) {
    const classNames = clsx({ [`${BASE_CLASS}--disabled`]: disabled }, className)
    return (
        <button
            ref={ref}
            disabled={disabled}
            className={classNames}
            aria-label={ariaLabel}
            {...rest}
        >
            {children}
        </button>
    )
})
