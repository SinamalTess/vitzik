import React, { OptionHTMLAttributes, ReactElement } from 'react'
import './Select.scss'

interface SelectProps {
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    children: ReactElement<OptionHTMLAttributes<HTMLOptionElement>>[]
}

export function Select({ onChange, children }: SelectProps) {
    return (
        <select onChange={onChange} className="mg-sm">
            {children}
        </select>
    )
}
