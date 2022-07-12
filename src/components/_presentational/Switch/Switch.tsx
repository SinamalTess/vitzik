import React from 'react'
import './Switch.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../types'

interface SwitchProps extends PresentationalComponentBasicProps {
    isOn: boolean
    onChange: () => void
    children: string | string[]
}

export function Switch({ style, className, children, isOn, onChange }: SwitchProps) {
    const classNames = clsx('switch', className)
    return (
        <label className={classNames} style={style}>
            {children}
            <input type="checkbox" checked={isOn} onChange={onChange} />
            <span className={'switch--icon'}>
                <span></span>
            </span>
        </label>
    )
}
