import React, { ReactNode } from 'react'
import clsx from 'clsx'

interface DropdownItemProps {
    className?: string[] | string
    children: ReactNode
}

export function DropdownItem({ className, children }: DropdownItemProps) {
    const classNames = clsx('dropdown__item', className)
    return <div className={classNames}>{children}</div>
}
