import React, { ReactNode } from 'react'
import './Select.scss'
import clsx from 'clsx'

interface SelectProps {
    className?: string | string[]
    value?: any
    children: ReactNode
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function Select({ className, children, value, onChange }: SelectProps) {
    const classNames = clsx('select', 'mg-sm', className)
    return (
        <select onChange={onChange} className={classNames} value={value}>
            {children}
        </select>
    )
}
