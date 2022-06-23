import { ReactElement } from 'react'
import React from 'react'

interface CheckBoxProps {
    children: ReactElement<Text>[]
    value: string
    checked: boolean
    onChange: (value: string) => void
}

export function CheckBox({ children, value, checked, onChange }: CheckBoxProps) {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        onChange(value)
    }

    return (
        <>
            <input type="checkbox" value={value} checked={checked} onChange={handleChange} />
            <label>{children}</label>
        </>
    )
}
