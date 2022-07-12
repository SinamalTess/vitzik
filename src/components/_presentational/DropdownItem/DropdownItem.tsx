import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface DropdownItemProps extends PresentationalComponentBasicProps {
    children: ReactNode
}

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
    function DropdownItem({ style, className, children }: DropdownItemProps, ref) {
        const classNames = clsx('dropdown__item', className)
        return (
            <div className={classNames} style={style} ref={ref}>
                {children}
            </div>
        )
    }
)
