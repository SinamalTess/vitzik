import React, { ReactNode, useState } from 'react'
import './Dropdown.scss'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

interface DropdownProps {
    children: ReactNode
    open: boolean
}

export function Dropdown({ children, open = false }: DropdownProps) {
    const [isOpen, setIsOpen] = useState<boolean>(open)

    if (!children || !Array.isArray(children)) return null

    const flatChildren = children.flat(1)

    const dropdownItems = flatChildren.filter(
        (child) => child.type && child.type.name === 'DropdownItem'
    )
    const dropdownToggle = flatChildren.filter(
        (child) => child.type && child.type.name === 'DropdownToggle'
    )[0]

    function handleClick() {
        setIsOpen((open) => !open)
    }

    return (
        <Tooltip arrow={false} referenceWidth show={isOpen}>
            <Button onClick={handleClick}>{dropdownToggle}</Button>
            {dropdownItems.map((dropdownItem: ReactNode) => dropdownItem)}
        </Tooltip>
    )
}
