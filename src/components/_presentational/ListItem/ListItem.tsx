import React, { ReactNode } from 'react'
import './ListItem.scss'
import clsx from 'clsx'

interface ListItemProps {
    children: ReactNode
    style?: React.CSSProperties
}

const classNames = clsx('list__item')

export function ListItem({ children, style }: ListItemProps) {
    return (
        <li className={classNames} style={style}>
            {children}
        </li>
    )
}
