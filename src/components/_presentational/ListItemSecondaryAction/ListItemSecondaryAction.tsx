import React, { ReactNode } from 'react'
import './ListItemSecondaryAction.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface ListItemSecondaryActionProps extends PresentationalComponentBasicProps {
    children: ReactNode
}

export function ListItemSecondaryAction({
    style,
    className,
    children,
}: ListItemSecondaryActionProps) {
    const classNames = clsx('list__item-secondary-action', className)

    return (
        <span className={classNames} style={style}>
            {children}
        </span>
    )
}
