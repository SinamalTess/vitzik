import { SVGRectangle } from 'vitzik-ui'
import React from 'react'
import { VisualizerNoteEvent } from '../types'

const RADIUS = 5

interface NoteProps {
    event: VisualizerNoteEvent
}

export function Note({ event }: NoteProps) {
    const { name, uniqueId, channel, x, y, w, h } = event
    return (
        <SVGRectangle
            aria-label={`${name} note`}
            key={`${uniqueId}`}
            className={`channel--${channel}`}
            x={x}
            y={y}
            rx={RADIUS}
            ry={RADIUS}
            w={w}
            h={h}
        />
    )
}
