import React from 'react'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'
import { Button } from '../Button'

interface DropdownToggleProps extends PresentationalComponentBasicProps {
    children: string
}

export const DropdownToggle = React.forwardRef<HTMLButtonElement, DropdownToggleProps>(
    function DropdownToggle({ style, className, children }: DropdownToggleProps, ref) {
        const classNames = clsx('dropdown__toggle', className)
        return (
            <Button className={classNames} style={style} ref={ref}>
                {children}
            </Button>
        )
    }
)
