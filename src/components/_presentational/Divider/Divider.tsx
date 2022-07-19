import React from 'react'
import './Divider.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface DividerProps extends PresentationalComponentBasicProps {
    orientation?: 'vertical' | 'horizontal'
}

const BASE_CLASS = 'divider'

export function Divider({ style, className, orientation = 'horizontal' }: DividerProps) {
    const classNames = clsx(
        BASE_CLASS,
        { [`${BASE_CLASS}--vertical`]: orientation === 'vertical' },
        className
    )

    return <hr className={classNames} style={style} />
}
