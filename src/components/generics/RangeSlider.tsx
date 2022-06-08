import React from 'react'
import './RangeSlider.scss'

interface RangeSliderPros {
    value: string | number
    onChange: (value: number) => void
    min?: number
    max?: number
}

export function RangeSlider({ value, onChange, min = 0, max = 100 }: RangeSliderPros) {
    return (
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(event) => onChange(parseInt(event.target.value))}
        />
    )
}
