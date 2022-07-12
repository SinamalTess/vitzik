import React from 'react'
import './Icon.scss'
import clsx from 'clsx'
import { IconName, CSSSpacingSize, PresentationalComponentBasicProps } from '../types'

interface IconProps extends PresentationalComponentBasicProps {
    name: IconName
    color?: string
    children?: string
    size?: CSSSpacingSize | number
}

export function Icon({ style, className, name, children, color, size = 'md' }: IconProps) {
    const classNames = clsx(
        'icon',
        { [`icon-${name}`]: name },
        { [`icon-instrument`]: name.startsWith('instrument') },
        { [`icon-${size}`]: typeof size === 'string' },
        className
    )

    const styles = {
        ...(typeof size === 'number' ? { fontSize: size + 'px', color } : { color }),
        ...{ style },
    }

    return (
        // TODO: check if this is the proper usage of aria-label
        <span className={classNames} style={styles} aria-label={`icon-${name}`}>
            {children}
        </span>
    )
}
