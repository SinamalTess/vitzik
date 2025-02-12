import React, { ReactNode } from 'react'
import './ButtonGroup.scss'
import { CSSSpacingSize, PresentationalComponentBasicProps } from '../../types'
import clsx from 'clsx'
import { isArrayOfChildren } from '../../utils/isArrayOfChildren'

interface ButtonGroupProps extends PresentationalComponentBasicProps<HTMLButtonElement> {
    children: ReactNode
    size?: CSSSpacingSize
}

interface IButtonGroupContext {
    size?: CSSSpacingSize
}

export const ButtonGroupContext = React.createContext<IButtonGroupContext>({})

const BASE_CLASS = 'btn-group'

export function ButtonGroup({ style, className, children, size = 'md' }: ButtonGroupProps) {
    if (!isArrayOfChildren(children, ButtonGroup.name)) return null

    const classNames = clsx(BASE_CLASS, 'mg-sm', className)

    return (
        <ButtonGroupContext.Provider value={{ size }}>
            <div className={classNames} role="group" style={style}>
                {children}
            </div>
        </ButtonGroupContext.Provider>
    )
}
