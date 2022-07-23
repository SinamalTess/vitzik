import React from 'react'
import './Switch.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'
import { Button } from '../Button'

interface SwitchProps extends PresentationalComponentBasicProps {
    isOn: boolean
    children: string | string[]
    onClick: () => void
    onMouseEnter?: (event: React.MouseEvent<HTMLLabelElement>) => void
    onMouseLeave?: (event: React.MouseEvent<HTMLLabelElement>) => void
}

const BASE_CLASS = 'switch'

export const Switch = React.forwardRef<HTMLLabelElement, SwitchProps>(function Switch(
    { style, className, children, isOn, onClick, onMouseEnter, onMouseLeave }: SwitchProps,
    ref
) {
    const classNames = clsx(BASE_CLASS, className)
    return (
        <label
            className={classNames}
            style={style}
            ref={ref}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
        >
            {children}
            <Button
                role="switch"
                onClick={onClick}
                className={clsx({ [`${BASE_CLASS}--active`]: isOn })}
                aria-checked={isOn}
            />
            <span className={`${BASE_CLASS}__icon`}>
                <span></span>
            </span>
        </label>
    )
})
