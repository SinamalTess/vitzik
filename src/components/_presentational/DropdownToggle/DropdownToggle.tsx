import React from 'react'
import clsx from 'clsx'

interface DropdownToggleProps {
    className?: string[] | string
    children: string
}

export function DropdownToggle({ className, children }: DropdownToggleProps) {
    const classNames = clsx('dropdown__toggle', className)
    return <span className={classNames}>{children}</span>
}
