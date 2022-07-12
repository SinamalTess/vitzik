import React, { ReactNode, useState } from 'react'
import './Dropdown.scss'
import { Button } from '../Button'
import { Tooltip } from '../Tooltip'

interface DropdownProps {
    children: ReactNode
    open: boolean
}

export function Dropdown({ children, open = false }: DropdownProps) {
    const [isOpen, setIsOpen] = useState<boolean>(open)

    if (!children || !Array.isArray(children)) return null

    /*
        Some children might be nested in others.
        We flatten all arrays of children to make sure we inspect all of them.
        Infinity is ok to use here.
        See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#flattening_nested_arrays
    */
    const allChildren = children.flat(Infinity)

    const dropdownItems = allChildren.filter(
        (child) => child.type && child.type.name === 'DropdownItem'
    )
    const dropdownToggle = allChildren.filter(
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
