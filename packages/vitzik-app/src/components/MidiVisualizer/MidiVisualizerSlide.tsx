import React from 'react'
import './MidiVisualizerSlide.scss'
import clsx from 'clsx'
import { isLoopTimestampEvent, isNoteEvent, VisualizerEvent, VisualizerNoteEvent } from './types'
import { MidiVisualizerVerticalLines } from './MidiVisualizerVerticalLines'
import { Note } from './events/Note'
import { LoopLine } from './events/LoopLine'
import { DampPedal } from './events/DampPedal'
import { MidiVisualizerConfig } from '../../types/MidiVisualizerConfig'
import { LoopTimestamps } from '../../types'

interface MidiVisualizerSlideProps {
    index: number
    config: MidiVisualizerConfig
    events: VisualizerEvent[] | null | undefined
}

interface EventsProps {
    config: MidiVisualizerConfig
    events: VisualizerEvent[]
}

const BASECLASS = `midi-visualizer__slide`

function getOpacityNote(event: VisualizerNoteEvent, loopTimestamps: LoopTimestamps) {
    const OPACITY_MIN = 0.1
    const OPACITY_DEFAULT = 1
    const { startingTime } = event
    let [startLoop, endLoop] = loopTimestamps
    let opacity = OPACITY_DEFAULT

    if (startLoop) {
        const isBelowStartLoop = startingTime < startLoop
        opacity = isBelowStartLoop ? OPACITY_MIN : OPACITY_DEFAULT

        if (endLoop) {
            const isAboveEndLoop = startingTime >= endLoop
            opacity = isBelowStartLoop || isAboveEndLoop ? OPACITY_MIN : OPACITY_DEFAULT
        }
    }

    return opacity
}

const Events = React.memo(function Events({ config, events }: EventsProps) {
    const { loopTimestamps } = config
    return (
        <>
            {events.map((event) => {
                if (isNoteEvent(event)) {
                    const { uniqueId } = event
                    const opacity = getOpacityNote(event, loopTimestamps)

                    return <Note event={event} key={`${uniqueId}`} opacity={opacity} />
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

export function MidiVisualizerSlide({ index, config, events }: MidiVisualizerSlideProps) {
    const { height, width } = config
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`])

    return (
        <div className={classNames}>
            <svg width={width} height={height} data-testid={`${BASECLASS}--${index}`}>
                {events ? <Events events={events} config={config} /> : null}
            </svg>
            <MidiVisualizerVerticalLines height={height} width={width} />
        </div>
    )
}
