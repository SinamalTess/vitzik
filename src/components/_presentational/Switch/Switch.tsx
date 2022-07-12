import React from 'react'
import './Switch.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface SwitchProps extends PresentationalComponentBasicProps {
    isOn: boolean
    children: string | string[]
    onChange: () => void
    onMouseEnter?: (event: React.MouseEvent<HTMLLabelElement>) => void
    onMouseLeave?: (event: React.MouseEvent<HTMLLabelElement>) => void
}

export const Switch = React.forwardRef<HTMLLabelElement, SwitchProps>(function Switch(
    { style, className, children, isOn, onChange, onMouseEnter, onMouseLeave }: SwitchProps,
    ref
) {
    const classNames = clsx('switch', className)
    return (
        <label
            className={classNames}
            style={style}
            ref={ref}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
        >
            {children}
            <input type="checkbox" checked={isOn} onChange={onChange} />
            <span className={'switch--icon'}>
                <span></span>
            </span>
        </label>
    )
})
