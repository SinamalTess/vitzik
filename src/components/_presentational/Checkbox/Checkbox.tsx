import { ReactNode } from 'react'
import React from 'react'
import './Checkbox.scss'
import clsx from 'clsx'

interface CheckboxProps {
    children?: ReactNode
    value: string
    checked?: boolean
    onChange: (value: React.ChangeEvent<HTMLInputElement>) => void
    disabled?: boolean
}

const classNames = clsx('checkbox')

export function Checkbox({
    children,
    value,
    checked = false,
    disabled = false,
    onChange,
}: CheckboxProps) {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event)
    }

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
