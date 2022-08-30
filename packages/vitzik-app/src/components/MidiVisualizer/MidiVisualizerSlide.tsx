import React from 'react'
import './MidiVisualizerSlide.scss'
import clsx from 'clsx'
import { isLoopTimestampEvent, isNoteEvent, VisualizerEvent } from './types'
import { MidiVisualizerVerticalLines } from './MidiVisualizerVerticalLines'
import { Note } from './events/Note'
import { LoopLine } from './events/LoopLine'
import { DampPedal } from './events/DampPedal'

interface MidiVisualizerSlideProps {
    index: number
    height: number
    width: number
    events: VisualizerEvent[] | null | undefined
}

interface EventsProps {
    events: VisualizerEvent[]
}

const BASECLASS = `midi-visualizer__slide`

const Events = React.memo(function Events({ events }: EventsProps) {
    return (
        <>
            {events.map((event) => {
                if (isNoteEvent(event)) {
                    const { uniqueId } = event
                    return <Note event={event} key={`${uniqueId}`} />
                } else if (isLoopTimestampEvent(event)) {
                    const { startingTime: timestamp, w: width, y } = event
                    return <LoopLine timestamp={timestamp} width={width} y={y} key={timestamp} />
                } else {
                    return <DampPedal event={event} />
                }
            })}
        </>
    )
})

export function MidiVisualizerSlide({ index, height, width, events }: MidiVisualizerSlideProps) {
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`])

    return (
        <div className={classNames}>
            <svg width={width} height={height} data-testid={`${BASECLASS}--${index}`}>
                {events ? <Events events={events} /> : null}
            </svg>
            <MidiVisualizerVerticalLines height={height} width={width} />
        </div>
    )
}
