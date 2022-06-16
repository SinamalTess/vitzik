import React from 'react'
import './RangeSlider.scss'

interface RangeSliderPros {
    value: string | number
    min?: number
    max?: number
    onMouseUp?: (value: number) => void
    onMouseDown?: (value: number) => void
    onChange: (value: number) => void
}

export function RangeSlider({
    value,
    onChange,
    onMouseUp,
    onMouseDown,
    min = 0,
    max = 100,
}: RangeSliderPros) {
    function handleOnMouseUp(event: React.MouseEvent<HTMLInputElement>) {
        if (onMouseUp) {
            //@ts-ignore
            onMouseUp(parseInt(event.target.value))
        }
    }

    function handleOnMouseDown(event: React.MouseEvent<HTMLInputElement>) {
        if (onMouseDown) {
            //@ts-ignore
            onMouseDown(parseInt(event.target.value))
        }
    }

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(parseInt(event.target.value))
    }

    return (
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleOnChange}
            onMouseUp={handleOnMouseUp}
            onMouseDown={handleOnMouseDown}
        />
    )
}
