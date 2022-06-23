import React, { ReactNode } from 'react'
import './Dropdown.scss'

interface DropdownItemProps {
    children: ReactNode
}

export function DropdownItem({ children }: DropdownItemProps) {
    return <div>{children}</div>
}
