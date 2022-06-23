import React, { ReactNode } from 'react'
import './ButtonGroup.scss'
import { CSSSpacingSize } from '../../types'

interface ButtonGroupProps {
    children: ReactNode
    size?: CSSSpacingSize
}

export function ButtonGroup({ children, size = 'md' }: ButtonGroupProps) {
    if (!children || !Array.isArray(children)) return null
    return (
        <div className="btn-group mg-sm" role="group">
            {children.map((child, index) =>
                React.cloneElement(child, { size, key: 'btn' + index })
            )}
        </div>
    )
}
