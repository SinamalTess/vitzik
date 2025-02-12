import { ReactNode } from 'react'
import React from 'react'
import './Checkbox.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'

interface CheckboxProps extends PresentationalComponentBasicProps<HTMLSpanElement> {
    children?: ReactNode
    value: string
    checked?: boolean
    disabled?: boolean
}

const BASE_CLASS = 'checkbox'

export function Checkbox({
    style,
    children,
    value,
    checked = false,
    disabled = false,
    className,
    ...rest
}: CheckboxProps) {
    const classNames = clsx(BASE_CLASS, className)

    return (
        <span className={classNames} {...rest}>
            <input
                aria-checked={checked}
                type="checkbox"
                value={value}
                checked={checked}
                disabled={disabled}
                style={style}
            />
            {children ? <label>{children}</label> : null}
        </span>
    )
}
