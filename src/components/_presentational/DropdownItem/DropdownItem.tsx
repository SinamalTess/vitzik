import React, { ReactNode } from 'react'
import clsx from 'clsx'

interface DropdownItemProps {
    children: ReactNode
}

const classNames = clsx('dropdown__item')

export function DropdownItem({ children }: DropdownItemProps) {
    return <div className={classNames}>{children}</div>
}
