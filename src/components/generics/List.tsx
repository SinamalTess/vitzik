import { ReactNode } from 'react'
import React from 'react'
import './List.scss'

interface ListProps {
    children: ReactNode
}

export function List({ children }: ListProps) {
    return <ul>{children}</ul>
}
