import React from 'react'
import './MidiVisualizerSlide.scss'
import clsx from 'clsx'
import { isLoopTimestampEvent, isNoteEvent, VisualizerEvent } from './types'
import { MidiVisualizerVerticalLines } from './MidiVisualizerVerticalLines'
import { Note } from './events/Note'
import { LoopLine } from './events/LoopLine'

interface MidiVisualizerSlideProps {
    index: number
    height: number
    width: number
    events: VisualizerEvent[] | null | undefined
    isTopSlide: boolean
}

interface EventsProps {
    events: VisualizerEvent[]
}

const BASECLASS = `midi-visualizer__slide`

const Events = React.memo(function Notes({ events }: EventsProps) {
    return (
        <>
            {events.map((event) => {
                if (isNoteEvent(event)) {
                    return <Note event={event} />
                } else if (isLoopTimestampEvent(event)) {
                    const { startingTime: timestamp, w: width, y } = event
                    return <LoopLine timestamp={timestamp} width={width} y={y} />
                } else {
                    return null
                }
            })}
        </>
    )
})

export function MidiVisualizerSlide({
    index,
    height,
    width,
    events,
    isTopSlide,
}: MidiVisualizerSlideProps) {
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`], {
        [`${BASECLASS}--top`]: isTopSlide,
    })

    return (
        <div className={classNames}>
            <svg width={width} height={height} data-testid={`${BASECLASS}--${index}`}>
                {events ? <Events events={events} /> : null}
            </svg>
            <MidiVisualizerVerticalLines height={height} width={width} />
        </div>
    )
}
