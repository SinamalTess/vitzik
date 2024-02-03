import { SVGLine } from 'vitzik-ui'
import { msToHumanReadableTime } from '@/utils'
import React from 'react'

interface LineProps {
    y: number
    width: number
    timestamp: number
    color?: string
    'data-testid'?: string
}

export function LoopLine({ y, width, timestamp, color = 'red' }: LineProps) {
    const TEXT_OFFSET = 20
    const yText = y + TEXT_OFFSET
    return (
        <>
            <SVGLine x1={0} y1={y} x2={width} color={color} aria-label={'loop-line'} />
            <text x="20" y={yText} className="small" fill={color} aria-label={'loop-line-text'}>
                {msToHumanReadableTime(timestamp, true)}
            </text>
        </>
    )
}
