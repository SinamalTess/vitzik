import React, { ReactNode } from 'react'
import './ListItem.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface ListItemProps extends PresentationalComponentBasicProps {
    children: ReactNode
}

export function ListItem({ className, children, style }: ListItemProps) {
    const classNames = clsx('list__item', className)
    return (
        <li className={classNames} style={style}>
            {children}
        </li>
    )
}
