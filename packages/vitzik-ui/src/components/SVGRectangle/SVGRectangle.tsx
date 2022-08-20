import React from 'react'

interface SVGRectangleProps {
    x: number
    y: number
    rx?: number
    ry?: number
    w: number
    h: number
    'aria-label': string
    className: string
}

export function SVGRectangle({
    x,
    y,
    rx = 0,
    ry = 0,
    w,
    h,
    'aria-label': ariaLabel,
    className,
}: SVGRectangleProps) {
    return (
        <rect
            aria-label={ariaLabel}
            className={className}
            x={x}
            y={y}
            rx={rx}
            ry={ry}
            width={w}
            height={h}
        />
    )
}