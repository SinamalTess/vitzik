import React, { ReactNode } from 'react'
import './ListItemSecondaryAction.scss'
import clsx from 'clsx'

interface ListItemSecondaryActionProps {
    style?: React.CSSProperties
    className?: string | string[]
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
