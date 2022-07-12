import React, { ReactNode } from 'react'
import clsx from 'clsx'

interface DropdownItemProps {
    style?: React.CSSProperties
    className?: string[] | string
    children: ReactNode
}

export function DropdownItem({ style, className, children }: DropdownItemProps) {
    const classNames = clsx('dropdown__item', className)
    return (
        <div className={classNames} style={style}>
            {children}
        </div>
    )
}
