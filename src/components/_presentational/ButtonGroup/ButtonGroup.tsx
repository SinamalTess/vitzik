import React, { ReactNode } from 'react'
import './ButtonGroup.scss'
import { CSSSpacingSize, PresentationalComponentBasicProps } from '../types'
import clsx from 'clsx'
import { isArrayOfChildren } from '../utils/isArrayOfChildren'

interface ButtonGroupProps extends PresentationalComponentBasicProps {
    children: ReactNode
    size?: CSSSpacingSize
}

export function ButtonGroup({ style, className, children, size = 'md' }: ButtonGroupProps) {
    if (!isArrayOfChildren(children, ButtonGroup.name)) return null

    const classNames = clsx('btn-group', 'mg-sm', className)

    const props = { size }

    return (
        <div className={classNames} role="group" style={style}>
            {children.map((child, index) => React.cloneElement(child, { ...props, key: index }))}
        </div>
    )
}
