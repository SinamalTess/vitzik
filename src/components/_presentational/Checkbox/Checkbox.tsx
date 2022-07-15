import { ReactNode } from 'react'
import React from 'react'
import './Checkbox.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface CheckboxProps extends PresentationalComponentBasicProps {
    children?: ReactNode
    value: string
    checked?: boolean
    disabled?: boolean
    onChange: (value: React.ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox({
    style,
    children,
    value,
    checked = false,
    disabled = false,
    className,
    onChange,
}: CheckboxProps) {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event)
    }

    const classNames = clsx('checkbox', className)

    return (
        <span className={classNames}>
            <input
                aria-checked={checked}
                type="checkbox"
                value={value}
                checked={checked}
                disabled={disabled}
                style={style}
                onChange={handleChange}
            />
            {children ? <label>{children}</label> : null}
        </span>
    )
}
