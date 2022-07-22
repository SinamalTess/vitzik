import React, { ReactNode } from 'react'
import './Select.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface SelectProps extends PresentationalComponentBasicProps {
    value?: any
    children: ReactNode
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

const BASE_CLASS = 'select'

export function Select({
    style,
    className,
    children,
    value,
    'data-testid': dataTestid,
    onChange,
}: SelectProps) {
    const classNames = clsx(BASE_CLASS, 'mg-sm', className)
    return (
        <select
            className={classNames}
            value={value}
            style={style}
            onChange={onChange}
            data-testid={dataTestid}
        >
            {children}
        </select>
    )
}
