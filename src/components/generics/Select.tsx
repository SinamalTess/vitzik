import React, { ReactNode } from 'react'
import './Select.scss'

interface SelectProps {
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    children: ReactNode
}

export function Select({ onChange, children }: SelectProps) {
    return (
        <select onChange={onChange} className="mg-sm">
            {children}
        </select>
    )
}
