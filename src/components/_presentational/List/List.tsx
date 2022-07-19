import { ReactNode } from 'react'
import React from 'react'
import './List.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface ListProps extends PresentationalComponentBasicProps {
    children: ReactNode
    variant?: 'background' | 'transparent'
}

export function List({ style, children, className, variant = 'background' }: ListProps) {
    const classNames = clsx('list', { 'list--background': variant === 'background' }, className)

    return (
        <ul className={classNames} style={style}>
            {children}
        </ul>
    )
}
