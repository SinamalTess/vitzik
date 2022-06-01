import { ButtonProps } from '../Button'
import { ReactElement } from 'react'
import React from 'react'
import './buttongroup.scss'

interface ButtonGroupProps {
    children: ReactElement<ButtonProps>[]
}

export function ButtonGroup({ children }: ButtonGroupProps) {
    return (
        <div className="btn-group" role="group">
            {children}
        </div>
    )
}
