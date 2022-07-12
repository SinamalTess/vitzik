import React from 'react'
import './Divider.scss'
import clsx from 'clsx'

interface DividerProps {
    style?: React.CSSProperties
    orientation?: 'vertical' | 'horizontal'
    className?: string[] | string
}

export function Divider({ style, className, orientation = 'horizontal' }: DividerProps) {
    const classNames = clsx(
        'divider',
        { 'divider--vertical': orientation === 'vertical' },
        className
    )

    return <hr className={classNames} style={style} />
}
