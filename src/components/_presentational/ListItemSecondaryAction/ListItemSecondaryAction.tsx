import React, { ReactNode } from 'react'
import './ListItemSecondaryAction.scss'
import clsx from 'clsx'

interface ListItemSecondaryActionProps {
    children: ReactNode
}

const classNames = clsx('list__item-secondary-action')

export function ListItemSecondaryAction({ children }: ListItemSecondaryActionProps) {
    return <span className={classNames}>{children}</span>
}
