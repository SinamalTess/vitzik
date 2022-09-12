import { SVGRectangle } from 'vitzik-ui'
import React from 'react'
import { VisualizerNoteEvent } from '../types'

const RADIUS = 5

interface NoteProps {
    event: VisualizerNoteEvent
    opacity?: number
}

export function Note({ event, opacity = 1 }: NoteProps) {
    const { name, channel, x, y, w, h } = event
    return (
        <SVGRectangle
            aria-label={`${name} note`}
            className={`channel--${channel}`}
            opacity={opacity}
            x={x}
            y={y}
            rx={RADIUS}
            ry={RADIUS}
            w={w}
            h={h}
        />
    )
}
