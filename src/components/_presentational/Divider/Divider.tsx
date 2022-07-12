import React from 'react'
import './Divider.scss'
import clsx from 'clsx'

interface DividerProps {
    orientation?: 'vertical' | 'horizontal'
}

export function Divider({ orientation = 'horizontal' }: DividerProps) {
    const classNames = clsx('divider', { 'divider--vertical': orientation === 'vertical' })

    return <hr className={classNames} />
}
