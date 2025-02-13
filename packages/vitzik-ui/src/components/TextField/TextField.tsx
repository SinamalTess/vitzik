import React, { ChangeEvent } from 'react'
import './TextField.scss'
import { IconName, PresentationalComponentBasicProps } from '../../types'
import { Icon } from '../Icon'
import clsx from 'clsx'

interface TextFieldProps extends PresentationalComponentBasicProps<HTMLInputElement> {
    value: string | number
    fitSize?: boolean
    icon?: IconName
    type?: 'text' | 'number'
    placeholder?: string
}

const BASE_CLASS = 'text-field'

export function TextField({
    style,
    className,
    value,
    fitSize = false,
    icon,
    placeholder,
    type = 'text',
    onChange,
}: TextFieldProps) {
    const classNames = clsx(BASE_CLASS, className)
    return (
        <span className={classNames} style={style}>
            {icon ? <Icon name={icon} /> : null}
            <input
                min={1}
                max={200}
                style={{ width: fitSize ? value.toString().length + 2 + 'ch' : 'auto' }}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </span>
    )
}
