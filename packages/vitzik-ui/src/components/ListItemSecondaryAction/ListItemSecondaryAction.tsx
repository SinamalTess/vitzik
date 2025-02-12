import React, { ReactNode } from 'react'
import './ListItemSecondaryAction.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'
import { BASE_CLASS as LIST_BASE_CLASS } from '../List/List'

interface ListItemSecondaryActionProps extends PresentationalComponentBasicProps<HTMLSpanElement> {
    children: ReactNode
}

const BASE_CLASS = `${LIST_BASE_CLASS}__item-secondary-action`

export function ListItemSecondaryAction({
    style,
    className,
    children,
}: ListItemSecondaryActionProps) {
    const classNames = clsx(BASE_CLASS, className)

    return (
        <span className={classNames} style={style}>
            {children}
        </span>
    )
}
