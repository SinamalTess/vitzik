import React, { ReactNode } from 'react'
import './Select.scss'

interface SelectProps {
    value?: any
    children: ReactNode
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function Select({ children, value, onChange }: SelectProps) {
    return (
        <select onChange={onChange} className="mg-sm" value={value}>
            {children}
        </select>
    )
}
