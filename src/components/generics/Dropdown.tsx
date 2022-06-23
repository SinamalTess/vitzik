import React, { ReactNode } from 'react'
import './Dropdown.scss'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

interface DropdownProps {
    children: ReactNode
}

export function Dropdown({ children }: DropdownProps) {
    if (!children || !Array.isArray(children)) return null

    const flatChildren = children.flat(1)

    const dropdownItems = flatChildren.filter(
        (child) => child.type && child.type.name === 'DropdownItem'
    )
    const dropdownToggle = flatChildren.filter(
        (child) => child.type && child.type.name === 'DropdownToggle'
    )[0]

    return (
        <Tooltip>
            <Button>{dropdownToggle}</Button>
            {dropdownItems.map((dropdownItem: ReactNode) => dropdownItem)}
        </Tooltip>
    )
}
