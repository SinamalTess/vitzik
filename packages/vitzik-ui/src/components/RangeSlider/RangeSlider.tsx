import React from 'react'
import './RangeSlider.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'

interface RangeSliderPros extends PresentationalComponentBasicProps<HTMLInputElement> {
    value?: string | number
    min?: number
    max?: number
    step?: number
}

const BASE_CLASS = 'range-slider'

export const RangeSlider = React.forwardRef<HTMLInputElement, RangeSliderPros>(function RangeSlider(
    { style, value, className, min = 0, max = 100, step, ...rest },
    ref
) {
    const classNames = clsx(BASE_CLASS, className)

    return (
        <input
            ref={ref}
            type="range"
            className={classNames}
            min={min}
            step={step}
            max={max}
            style={style}
            value={value}
            {...rest}
        />
    )
})
