import { ReactElement } from 'react'
import React from 'react'
import './List.scss'

interface ListProps {
    children: ReactElement[]
}

export function List({ children }: ListProps) {
    return <ul>{children}</ul>
}
