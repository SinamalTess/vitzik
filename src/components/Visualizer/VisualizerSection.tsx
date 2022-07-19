import React from 'react'
import './VisualizerSection.scss'
import clsx from 'clsx'
import { MidiVisualizerNoteCoordinates } from '../../types'

interface VisualizerSectionProps {
    index: number
    indexToDraw: number
    height: number
    width: number
    notesCoordinates: MidiVisualizerNoteCoordinates[] | null | undefined
}

interface RectanglesProps {
    notesCoordinates: MidiVisualizerNoteCoordinates[]
    height: number
    indexToDraw: number
}

const BASECLASS = `visualizer__section`

const Notes = React.memo(function Notes({
    notesCoordinates,
    height,
    indexToDraw,
}: RectanglesProps) {
    return (
        <>
            {notesCoordinates.map(({ channel, y, x, w, h, id, name }) => (
                <rect
                    aria-label={`${name} note`}
                    key={id}
                    className={`channel--${channel}`}
                    x={x}
                    y={y - indexToDraw * height}
                    rx="5"
                    ry="5"
                    width={w}
                    height={h}
                />
            ))}
        </>
    )
})

export function VisualizerSection({
    index,
    indexToDraw,
    height,
    width,
    notesCoordinates,
}: VisualizerSectionProps) {
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`])

    return (
        <svg
            width={width}
            height={height}
            data-testid={`${BASECLASS}--${index}`}
            className={classNames}
        >
            {notesCoordinates ? (
                <Notes
                    notesCoordinates={notesCoordinates}
                    height={height}
                    indexToDraw={indexToDraw}
                />
            ) : null}
        </svg>
    )
}
