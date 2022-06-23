import React from 'react'
import './Dropdown.scss'

interface DropdownToggleProps {
    children: string
}

export function DropdownToggle({ children }: DropdownToggleProps) {
    return <>{children}</>
}
