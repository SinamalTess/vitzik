import { ButtonProps } from '../Button'
import { ReactElement } from 'react'
import React from 'react'
import './buttongroup.scss'

interface ButtonGroupProps {
    children: ReactElement<ButtonProps>[]
}

// TODO: the size should be configurable
export function ButtonGroup({ children }: ButtonGroupProps) {
    return (
        <div className="btn-group margin--sm" role="group">
            {children}
        </div>
    )
}
