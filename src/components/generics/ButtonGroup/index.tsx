import { ButtonProps } from '../Button'
import { ReactElement } from 'react'
import React from 'react'
import './buttongroup.scss'
import { CSSSpacingSize } from '../../../types'

interface ButtonGroupProps {
    children: ReactElement<ButtonProps>[]
    size?: CSSSpacingSize
}

export function ButtonGroup({ children, size = 'md' }: ButtonGroupProps) {
    return (
        <div className="btn-group mg-sm" role="group">
            {children.map((child) => React.cloneElement(child, { size }))}
        </div>
    )
}
