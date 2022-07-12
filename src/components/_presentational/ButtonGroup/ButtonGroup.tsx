import React, { ReactNode } from 'react'
import './ButtonGroup.scss'
import { CSSSpacingSize } from '../types'
import clsx from 'clsx'

interface ButtonGroupProps {
    style?: React.CSSProperties
    children: ReactNode
    className?: string[] | string
    size?: CSSSpacingSize
}

export function ButtonGroup({ style, className, children, size = 'md' }: ButtonGroupProps) {
    if (!children || !Array.isArray(children)) return null

    const classNames = clsx('btn-group', 'mg-sm', className)

    return (
        <div className={classNames} role="group" style={style}>
            {children.map((child, index) =>
                React.cloneElement(child, { size, key: 'btn' + index })
            )}
        </div>
    )
}
