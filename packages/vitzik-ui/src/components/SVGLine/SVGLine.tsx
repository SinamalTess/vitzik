import React from 'react'

interface SVGLineProps {
    x1: number
    x2?: number
    y1: number
    y2?: number
    color?: string
    'aria-label'?: string
}

export function SVGLine({
    x1,
    x2 = x1,
    y1,
    y2 = y1,
    color,
    'aria-label': ariaLabel,
}: SVGLineProps) {
    return (
        <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={1}
            aria-label={ariaLabel}
        />
    )
}
