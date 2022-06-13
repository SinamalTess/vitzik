import React, { OptionHTMLAttributes, ReactElement } from 'react'
import './Select.scss'

interface SelectProps {
    onChange: (event: any) => void
    name: string
    children: ReactElement<OptionHTMLAttributes<HTMLOptionElement>>[]
}

export function Select({ name, onChange, children }: SelectProps) {
    return (
        <select name={name} onChange={onChange}>
            {children}
        </select>
    )
}
