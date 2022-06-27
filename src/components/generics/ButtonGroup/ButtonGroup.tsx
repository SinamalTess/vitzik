import React, { ReactNode } from 'react'
import './ButtonGroup.scss'
import { CSSSpacingSize } from '../types'
import clsx from 'clsx'

interface ButtonGroupProps {
    children: ReactNode
    size?: CSSSpacingSize
}

export function ButtonGroup({ children, size = 'md' }: ButtonGroupProps) {
    if (!children || !Array.isArray(children)) return null

    const className = clsx('btn-group', 'mg-sm')

    return (
        <div className={className} role="group">
            {children.map((child, index) =>
                React.cloneElement(child, { size, key: 'btn' + index })
            )}
        </div>
    )
}
