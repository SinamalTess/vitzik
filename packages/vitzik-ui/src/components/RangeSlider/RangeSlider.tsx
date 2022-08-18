import React from 'react'
import './RangeSlider.scss'
import clsx from 'clsx'
import { PresentationalComponentBasicProps } from '../../types'

interface RangeSliderPros extends PresentationalComponentBasicProps {
    value?: string | number
    min?: number
    max?: number
    step?: number
    onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void
    onMouseDown?: (event: React.MouseEvent<HTMLInputElement>) => void
    onMouseMove?: (event: React.MouseEvent<HTMLInputElement>) => void
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const BASE_CLASS = 'range-slider'

export const RangeSlider = React.forwardRef<HTMLInputElement, RangeSliderPros>(function RangeSlider(
    {
        style,
        value,
        className,
        min = 0,
        max = 100,
        step,
        onMouseMove,
        onChange,
        onMouseUp,
        onMouseDown,
    },
    ref
) {
    function handleMouseUp(event: React.MouseEvent<HTMLInputElement>) {
        if (onMouseUp) {
            onMouseUp(event)
        }
    }

    function handleMouseDown(event: React.MouseEvent<HTMLInputElement>) {
        if (onMouseDown) {
            onMouseDown(event)
        }
    }

    function handleMouseMove(event: React.MouseEvent<HTMLInputElement>) {
        if (onMouseMove) {
            onMouseMove(event)
        }
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event)
    }

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
            onChange={handleChange}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
        />
    )
})
