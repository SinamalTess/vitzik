import React from 'react'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'
import { Button } from '../Button'
import { BASE_CLASS as DROPDOWN_BASE_CLASS } from '../Dropdown/Dropdown'

interface DropdownToggleProps extends PresentationalComponentBasicProps<HTMLButtonElement> {
    children: string
}

const BASE_CLASS = `${DROPDOWN_BASE_CLASS}__toggle`

export const DropdownToggle = React.forwardRef<HTMLButtonElement, DropdownToggleProps>(
    function DropdownToggle({ style, className, children, ...rest }: DropdownToggleProps, ref) {
        const classNames = clsx(BASE_CLASS, className)

        return (
            <Button className={classNames} style={style} ref={ref} {...rest}>
                {children}
            </Button>
        )
    }
)
