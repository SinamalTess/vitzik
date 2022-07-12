import React from 'react'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface DropdownToggleProps extends PresentationalComponentBasicProps {
    children: string
}

export function DropdownToggle({ style, className, children }: DropdownToggleProps) {
    const classNames = clsx('dropdown__toggle', className)
    return (
        <span className={classNames} style={style}>
            {children}
        </span>
    )
}
