import React from 'react'
import './Switch.scss'
import clsx from 'clsx'

interface SwitchProps {
    isOn: boolean
    onChange: () => void
    children: string | string[]
}

const classNames = clsx('switch')

export function Switch({ isOn, onChange, children }: SwitchProps) {
    return (
        <label className={classNames}>
            {children}
            <input type="checkbox" checked={isOn} onChange={onChange} />
            <span className={'switch--icon'}>
                <span></span>
            </span>
        </label>
    )
}
