import React, { ReactNode } from 'react'
import './ListItem.scss'
import clsx from 'clsx'

interface ListItemProps {
    className?: string | string[]
    children: ReactNode
    style?: React.CSSProperties
}

export function ListItem({ className, children, style }: ListItemProps) {
    const classNames = clsx('list__item', className)
    return (
        <li className={classNames} style={style}>
            {children}
        </li>
    )
}
