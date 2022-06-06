import React from 'react'

interface RangeSliderPros {
    value: string | number
    setValue: (value: number) => void
    min?: number
    max?: number
}

export function RangeSlider({ value, setValue, min = 0, max = 100 }: RangeSliderPros) {
    return (
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(event) => setValue(parseInt(event.target.value))}
        />
    )
}
