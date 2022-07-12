import React, { ReactNode } from 'react'
import './ListItemSecondaryAction.scss'

interface ListItemSecondaryActionProps {
    children: ReactNode
}

export function ListItemSecondaryAction({ children }: ListItemSecondaryActionProps) {
    return <span className={'list-item-secondary-action'}>{children}</span>
}
