import React from 'react'
import clsx from 'clsx'

interface DropdownToggleProps {
    children: string
}

const classNames = clsx('dropdown__toggle')

export function DropdownToggle({ children }: DropdownToggleProps) {
    return <span className={classNames}>{children}</span>
}
