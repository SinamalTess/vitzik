import { ReactNode } from 'react'
import React from 'react'
import './List.scss'
import clsx from 'clsx'

interface ListProps {
    style?: React.CSSProperties
    children: ReactNode
    className?: string | string[]
    type?: 'background' | 'transparent'
}

export function List({ style, children, className, type = 'background' }: ListProps) {
    const classNames = clsx('list', { 'list--background': type === 'background' }, className)

    return (
        <ul className={classNames} style={style}>
            {children}
        </ul>
    )
}
