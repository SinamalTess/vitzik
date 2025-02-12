import React, { ReactNode, useState } from 'react'
import './Dropdown.scss'
import { Tooltip } from '../Tooltip'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'
import { isArrayOfChildren } from '../../utils/isArrayOfChildren'

interface DropdownProps extends PresentationalComponentBasicProps<HTMLDivElement> {
    children: ReactNode
    open?: boolean
}

export const BASE_CLASS = 'dropdown'

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
    { style, className, children, open = false }: DropdownProps,
    ref
) {
    const [isOpen, setIsOpen] = useState<boolean>(open)

    if (!isArrayOfChildren(children, Dropdown.name)) return null

    function handleClick() {
        setIsOpen((open) => !open)
    }

    const classNames = clsx(BASE_CLASS, className)

    return (
        <div className={classNames} style={style} onClick={handleClick} ref={ref}>
            <Tooltip arrow={false} referenceWidth show={isOpen}>
                {children.map((child) => child)}
            </Tooltip>
        </div>
    )
})
