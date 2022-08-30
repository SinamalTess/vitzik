import { SVGRectangle } from 'vitzik-ui'
import React from 'react'

import { VisualizerEvent } from '../types'

interface DampPedalProps {
    event: VisualizerEvent
}

export function DampPedal({ event }: DampPedalProps) {
    const { w, y, x, h } = event
    return <SVGRectangle x={x} y={y} rx={0} ry={0} w={w} h={h} opacity={0.05} color={'orange'} />
}
