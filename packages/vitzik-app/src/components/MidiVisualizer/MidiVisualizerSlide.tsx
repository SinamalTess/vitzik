import React from 'react'
import './MidiVisualizerSlide.scss'
import clsx from 'clsx'
import { SVGRectangle } from 'vitzik-ui'
import { VisualizerNoteEvent } from './types'
import { MidiVisualizerVerticalLines } from './MidiVisualizerVerticalLines'

interface MidiVisualizerSlideProps {
    index: number
    height: number
    width: number
    noteEvents: VisualizerNoteEvent[] | null | undefined
    isTopSlide: boolean
}

interface RectanglesProps {
    noteEvents: VisualizerNoteEvent[]
}

const BASECLASS = `midi-visualizer__slide`

const Notes = React.memo(function Notes({ noteEvents }: RectanglesProps) {
    return (
        <>
            {noteEvents.map(({ channel, uniqueId, y, x, w, h, name }) => (
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
    noteEvents,
    isTopSlide,
}: MidiVisualizerSlideProps) {
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`], {
        [`${BASECLASS}--top`]: isTopSlide,
    })

    return (
        <div className={classNames}>
            <svg width={width} height={height} data-testid={`${BASECLASS}--${index}`}>
                {noteEvents ? <Notes noteEvents={noteEvents} /> : null}
            </svg>
            <MidiVisualizerVerticalLines height={height} width={width} />
        </div>
    )
}
