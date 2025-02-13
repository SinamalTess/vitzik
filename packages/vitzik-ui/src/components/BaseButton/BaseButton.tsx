import clsx from 'clsx'
import React, { ReactNode } from 'react'
import { CSSSpacingSize, PresentationalComponentBasicProps } from '../../types'

export interface BaseButtonProps extends PresentationalComponentBasicProps<HTMLButtonElement> {
    children?: ReactNode
    disabled?: boolean
    size?: CSSSpacingSize
}

export const BASE_CLASS = 'btn'

export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(function BaseButton(
    { children, className, disabled = false, ...rest }: BaseButtonProps,
    ref
) {
    const classNames = clsx({ [`${BASE_CLASS}--disabled`]: disabled }, className)
    return (
        <button ref={ref} disabled={disabled} className={classNames} {...rest}>
            {children}
        </button>
    )
})
