import React, { ReactNode } from 'react'
import './ListItem.scss'

interface ListItemProps {
    children: ReactNode
    style?: React.CSSProperties
}

export function ListItem({ children, style }: ListItemProps) {
    return <li style={style}>{children}</li>
}
