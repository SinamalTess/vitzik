import React from 'react'

interface SVGRectangleProps {
    x: number
    y: number
    rx?: number
    ry?: number
    w: number
    h: number
    'aria-label'?: string
    className?: string
    opacity?: number
    color?: string
}

export const SVGRectangle = React.forwardRef<SVGRectElement, SVGRectangleProps>(
    function SVGRectangle(
        {
            x,
            y,
            rx = 0,
            ry = 0,
            w,
            h,
            opacity,
            color,
            'aria-label': ariaLabel,
            className,
            ...rest
        }: SVGRectangleProps,
        ref
    ) {
        return (
            <rect
                ref={ref}
                aria-label={ariaLabel}
                className={className}
                x={x}
                y={y}
                rx={rx}
                ry={ry}
                width={w}
                height={h}
                opacity={opacity}
                fill={color}
                {...rest}
            />
        )
    }
)
