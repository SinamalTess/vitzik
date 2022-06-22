import React, { OptionHTMLAttributes, ReactElement } from 'react'
import './Select.scss'

interface SelectProps {
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    name: string
    children: ReactElement<OptionHTMLAttributes<HTMLOptionElement>>[]
}

export function Select({ name, onChange, children }: SelectProps) {
    return (
        <select name={name} onChange={onChange} className="mg-sm">
            {children}
        </select>
    )
}
