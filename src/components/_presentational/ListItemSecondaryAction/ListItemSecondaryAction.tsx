import React, { ReactNode } from 'react'
import './ListItemSecondaryAction.scss'
import clsx from 'clsx'

interface ListItemSecondaryActionProps {
    className?: string | string[]
    children: ReactNode
}

export function ListItemSecondaryAction({ className, children }: ListItemSecondaryActionProps) {
    const classNames = clsx('list__item-secondary-action', className)

    return <span className={classNames}>{children}</span>
}
