import { ReactNode } from 'react'
import React from 'react'

interface CheckboxProps {
    children: ReactNode
    value: string
    checked?: boolean
    onChange: (value: React.ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox({ children, value, checked = false, onChange }: CheckboxProps) {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event)
    }

    return (
        <>
            <input type="checkbox" value={value} checked={checked} onChange={handleChange} />
            <label>{children}</label>
        </>
    )
}
