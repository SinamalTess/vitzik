import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'
import { BASE_CLASS as DROPDOWN_BASE_CLASS } from '../Dropdown/Dropdown'

interface DropdownItemProps extends PresentationalComponentBasicProps<HTMLDivElement> {
    children: ReactNode
}

const BASE_CLASS = `${DROPDOWN_BASE_CLASS}__item`

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
    function DropdownItem({ style, className, children, ...rest }: DropdownItemProps, ref) {
        const classNames = clsx(BASE_CLASS, className)
        return (
            <div className={classNames} style={style} ref={ref} {...rest}>
                {children}
            </div>
        )
    }
)
