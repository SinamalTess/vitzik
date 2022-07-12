import React, { ReactNode } from 'react'
import './Select.scss'
import clsx from 'clsx'

interface SelectProps {
    value?: any
    children: ReactNode
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

const classNames = clsx('select', 'mg-sm')

export function Select({ children, value, onChange }: SelectProps) {
    return (
        <select onChange={onChange} className={classNames} value={value}>
            {children}
        </select>
    )
}
