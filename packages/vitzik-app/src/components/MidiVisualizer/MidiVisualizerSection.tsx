import React from 'react'
import './MidiVisualizerSection.scss'
import clsx from 'clsx'
import { SVGRectangle } from 'vitzik-ui'
import { MidiVisualizerNoteEvent } from './utils'

interface MidiVisualizerSectionProps {
    index: number
    height: number
    width: number
    notesCoordinates: MidiVisualizerNoteEvent[] | null | undefined
}

interface RectanglesProps {
    notesCoordinates: MidiVisualizerNoteEvent[]
}

const BASECLASS = `midi-visualizer__section`

const Notes = React.memo(function Notes({ notesCoordinates }: RectanglesProps) {
    return (
        <>
            {notesCoordinates.map(({ channel, uniqueId, y, x, w, h, name }) => (
                <SVGRectangle
                    aria-label={`${name} note`}
                    key={`${uniqueId}`}
                    className={`channel--${channel}`}
                    x={x}
                    y={y}
                    rx={5}
                    ry={5}
                    w={w}
                    h={h}
                />
            ))}
        </>
    )
})

export function MidiVisualizerSection({
    index,
    height,
    width,
    notesCoordinates,
}: MidiVisualizerSectionProps) {
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`])

    return (
        <svg
            width={width}
            height={height}
            data-testid={`${BASECLASS}--${index}`}
            className={classNames}
        >
            {notesCoordinates ? <Notes notesCoordinates={notesCoordinates} /> : null}
        </svg>
    )
}
