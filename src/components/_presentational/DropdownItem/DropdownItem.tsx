import React, { ReactNode } from 'react'

interface DropdownItemProps {
    children: ReactNode
}

export function DropdownItem({ children }: DropdownItemProps) {
    return <div>{children}</div>
}
