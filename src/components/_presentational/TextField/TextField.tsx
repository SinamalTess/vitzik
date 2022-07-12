import React, { ChangeEvent } from 'react'
import './TextField.scss'
import { IconName } from '../types'
import { Icon } from '../Icon'
import clsx from 'clsx'

interface TextFieldProps {
    className?: string | string[]
    value: string | number
    fitSize?: boolean
    icon?: IconName
    type?: 'text' | 'number'
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function TextField({
    className,
    value,
    fitSize = false,
    icon,
    type = 'text',
    onChange,
}: TextFieldProps) {
    const classNames = clsx('text-field', className)
    return (
        <span className={classNames}>
            {icon ? <Icon name={icon} /> : null}
            <input
                min={1}
                max={200}
                style={{ width: fitSize ? value.toString().length + 2 + 'ch' : 'auto' }}
                type={type}
                value={value}
                onChange={onChange}
            />
        </span>
    )
}
