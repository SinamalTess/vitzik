import React, { useContext } from 'react'
import './Button.scss'
import { CSSColor, IconName } from '../../types'
import clsx from 'clsx'
import { ButtonGroupContext } from '../ButtonGroup/ButtonGroup'
import { BaseButton } from '../BaseButton'
import { BaseButtonProps, BASE_CLASS } from '../BaseButton/BaseButton'
import { Icon } from '../Icon'

type ButtonVariant = 'outlined' | 'filled' | 'text'

export interface ButtonProps extends BaseButtonProps {
    icon?: IconName
    color?: CSSColor
    variant?: ButtonVariant
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        children,
        icon,
        size: sizeOwn = 'md',
        color = 'primary',
        variant = 'filled',
        className,
        ...rest
    },
    ref
) {
    const { size: sizeContext } = useContext(ButtonGroupContext)
    const size = sizeContext ?? sizeOwn

    const classNames = clsx(
        BASE_CLASS,
        { [`${BASE_CLASS}-${size}`]: size },
        { [`pd-${size}`]: size },
        { [`${BASE_CLASS}--${variant}`]: variant },
        { [`${BASE_CLASS}--${variant}--${color}`]: color },
        className
    )

    return (
        <BaseButton ref={ref} className={classNames} size={size} {...rest}>
            {icon ? (
                <Icon
                    name={icon}
                    size={size}
                    className={clsx({ [`pd-r-${size}`]: size && children })}
                />
            ) : null}
            {children}
        </BaseButton>
    )
})
