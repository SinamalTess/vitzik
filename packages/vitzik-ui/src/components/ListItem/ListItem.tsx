import React, { ReactNode } from 'react'
import './ListItem.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'
import { BASE_CLASS as LIST_BASE_CLASS } from '../List/List'

interface ListItemProps extends PresentationalComponentBasicProps {
    children: ReactNode
}

const BASE_CLASS = `${LIST_BASE_CLASS}__item`

export function ListItem({ className, children, style }: ListItemProps) {
    const classNames = clsx(BASE_CLASS, className)
    return (
        <li className={classNames} style={style}>
            {children}
        </li>
    )
}
