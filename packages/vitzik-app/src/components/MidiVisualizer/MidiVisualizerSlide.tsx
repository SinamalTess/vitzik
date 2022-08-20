import React from 'react'
import './MidiVisualizerSlide.scss'
import clsx from 'clsx'
import { SVGRectangle } from 'vitzik-ui'
import { MidiVisualizerNoteEvent } from './utils'
import { MidiVisualizerVerticalLines } from './MidiVisualizerVerticalLines'

interface MidiVisualizerSlideProps {
    index: number
    height: number
    width: number
    notesCoordinates: MidiVisualizerNoteEvent[] | null | undefined
}

interface RectanglesProps {
    notesCoordinates: MidiVisualizerNoteEvent[]
}

const BASECLASS = `midi-visualizer__slide`

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

export function MidiVisualizerSlide({
    index,
    height,
    width,
    notesCoordinates,
}: MidiVisualizerSlideProps) {
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`])

    return (
        <div className={classNames}>
            <svg width={width} height={height} data-testid={`${BASECLASS}--${index}`}>
                {notesCoordinates ? <Notes notesCoordinates={notesCoordinates} /> : null}
            </svg>
            <MidiVisualizerVerticalLines height={height} width={width} />
        </div>
    )
}
