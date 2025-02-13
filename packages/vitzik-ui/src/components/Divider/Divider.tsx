import React from 'react'
import './Divider.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'

interface DividerProps extends PresentationalComponentBasicProps<HTMLHRElement> {
    variant?: 'vertical' | 'horizontal'
}

const BASE_CLASS = 'divider'

export function Divider({ style, className, variant = 'horizontal', ...rest }: DividerProps) {
    const classNames = clsx(
        BASE_CLASS,
        { [`${BASE_CLASS}--vertical`]: variant === 'vertical' },
        className
    )

    return <hr className={classNames} style={style} {...rest} />
}
