import React from 'react'
import './RangeSlider.scss'

interface RangeSliderPros {
    value: string | number
    min?: number
    max?: number
    onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void
    onMouseDown?: (event: React.MouseEvent<HTMLInputElement>) => void
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function RangeSlider({
    value,
    onChange,
    onMouseUp,
    onMouseDown,
    min = 0,
    max = 100,
}: RangeSliderPros) {
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

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event)
    }

    return (
        <input
            type="range"
            className={'range-slider'}
            min={min}
            max={max}
            value={value}
            onChange={handleChange}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
        />
    )
}
