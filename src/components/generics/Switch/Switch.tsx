import React from 'react'
import './Switch.scss'

interface SwitchProps {
    isOn: boolean
    onChange: () => void
    children: string | string[]
}

export function Switch({ isOn, onChange, children }: SwitchProps) {
    return (
        <label className="switch">
            {children}
            <input type="checkbox" checked={isOn} onChange={onChange} />
            <span className={'switch--icon'}>
                <span></span>
            </span>
        </label>
    )
}
