import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface DropdownItemProps extends PresentationalComponentBasicProps {
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
