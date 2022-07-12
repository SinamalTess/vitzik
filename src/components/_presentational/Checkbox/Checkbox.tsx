import { ReactNode } from 'react'
import React from 'react'
import './Checkbox.scss'
import clsx from 'clsx'

interface CheckboxProps {
    children?: ReactNode
    value: string
    checked?: boolean
    disabled?: boolean
    className?: string[] | string
    onChange: (value: React.ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox({
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
                type="checkbox"
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={handleChange}
            />
            {children ? <label>{children}</label> : null}
        </span>
    )
}
