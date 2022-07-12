import { ReactNode } from 'react'
import React from 'react'
import './List.scss'
import clsx from 'clsx'

interface ListProps {
    children: ReactNode
    className?: string
    type?: 'background' | 'transparent'
}

export function List({ children, className, type = 'background' }: ListProps) {
    const classNames = clsx('list', { 'list--background': type === 'background' }, className)

    return <ul className={classNames}>{children}</ul>
}
