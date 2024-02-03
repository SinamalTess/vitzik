import React from 'react'
import './Slide.scss'
import clsx from 'clsx'
import { VisualizerEvent } from '../../types'
import { VerticalLines } from '../VerticalLines'
import { Note } from '../Note'
import { LoopLine } from '../LoopLine'
import { DampPedal } from '../DampPedal'
import { MidiVisualizerConfig } from '@/types/MidiVisualizerConfig'
import { LoopTimestamps } from '@/types'
import { NoteEvent } from '../../classes/NoteEvent'
import { LoopEvent } from '../../classes/LoopEvent'

interface SlideProps {
    index: number
    config: MidiVisualizerConfig
    events: VisualizerEvent[] | null | undefined
}

interface EventsProps {
    config: MidiVisualizerConfig
    events: VisualizerEvent[]
}

const BASECLASS = `midi-visualizer__slide`

function getOpacityNote(event: VisualizerEvent, loopTimestamps: LoopTimestamps) {
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
                if (event instanceof NoteEvent) {
                    const { uniqueId } = event
                    const opacity = getOpacityNote(event, loopTimestamps)

                    return <Note event={event} key={uniqueId} opacity={opacity} />
                } else if (event instanceof LoopEvent) {
                    const { startingTime: timestamp } = event
                    const { w: width, y } = event.coordinates

                    return <LoopLine timestamp={timestamp} width={width} y={y} key={timestamp} />
                } else {
                    return <DampPedal event={event} />
                }
            })}
        </>
    )
})

export function Slide({ index, config, events }: SlideProps) {
    const { height, width } = config
    const classNames = clsx(BASECLASS, [`${BASECLASS}--${index}`])

    return (
        <div className={classNames}>
            <svg width={width} height={height} data-testid={`${BASECLASS}--${index}`}>
                {events ? <Events events={events} config={config} /> : null}
            </svg>
            <VerticalLines height={height} width={width} />
        </div>
    )
}
