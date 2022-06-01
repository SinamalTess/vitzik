import { ButtonProps } from '../Button'
import { ReactElement } from 'react'
import React from 'react'

interface ButtonGroupProps {
    children: ReactElement<ButtonProps>[]
}

export function ButtonGroup({ children }: ButtonGroupProps) {
    return <>{children}</>
}
