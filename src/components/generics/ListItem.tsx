import React, { ReactNode } from 'react'

export interface ListItemProps {
    children: ReactNode
    style?: React.CSSProperties
}

export function ListItem({ children, style }: ListItemProps) {
    return <li style={style}>{children}</li>
}
