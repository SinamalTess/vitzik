import React from 'react'
import './Icon.scss'
import clsx from 'clsx'
import { IconName, CSSSpacingSize, PresentationalComponentBasicProps } from '../types'

interface IconProps extends PresentationalComponentBasicProps {
    name: IconName
    color?: string
    children?: string
    size?: CSSSpacingSize | number
    onMouseEnter?: (event: React.MouseEvent<HTMLSpanElement>) => void
    onMouseLeave?: (event: React.MouseEvent<HTMLSpanElement>) => void
}

const BASE_CLASS = 'icon'

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
    { style, className, name, children, color, size = 'md', onMouseLeave, onMouseEnter },
    ref
) {
    const classNames = clsx(
        BASE_CLASS,
        { [`${BASE_CLASS}-${name}`]: name },
        { [`${BASE_CLASS}-instrument`]: name.startsWith('instrument') },
        { [`${BASE_CLASS}-${size}`]: typeof size === 'string' },
        className
    )

    const styles = {
        ...(typeof size === 'number' ? { fontSize: size + 'px', color } : { color }),
        ...{ style },
    }

    return (
        // TODO: check if this is the proper usage of aria-label
        <span
            className={classNames}
            style={styles}
            aria-label={`icon ${name}`}
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </span>
    )
})
