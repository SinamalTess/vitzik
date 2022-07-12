import React from 'react'
import './Divider.scss'
import clsx from 'clsx'

interface DividerProps {
    orientation?: 'vertical' | 'horizontal'
    className?: string[] | string
}

export function Divider({ className, orientation = 'horizontal' }: DividerProps) {
    const classNames = clsx(
        'divider',
        { 'divider--vertical': orientation === 'vertical' },
        className
    )

    return <hr className={classNames} />
}
