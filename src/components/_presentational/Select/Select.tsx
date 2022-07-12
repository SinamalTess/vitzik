import React, { ReactNode } from 'react'
import './Select.scss'
import clsx from 'clsx'

interface SelectProps {
    style?: React.CSSProperties
    className?: string | string[]
    value?: any
    children: ReactNode
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function Select({ style, className, children, value, onChange }: SelectProps) {
    const classNames = clsx('select', 'mg-sm', className)
    return (
        <select className={classNames} value={value} style={style} onChange={onChange}>
            {children}
        </select>
    )
}
