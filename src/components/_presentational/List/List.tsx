import { ReactNode } from 'react'
import React from 'react'
import './List.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface ListProps extends PresentationalComponentBasicProps {
    children: ReactNode
    variant?: 'background' | 'transparent'
}

export const BASE_CLASS = 'list'

export function List({ style, children, className, variant = 'background' }: ListProps) {
    const classNames = clsx(
        BASE_CLASS,
        { [`${BASE_CLASS}--background`]: variant === 'background' },
        className
    )

    return (
        <ul className={classNames} style={style}>
            {children}
        </ul>
    )
}
