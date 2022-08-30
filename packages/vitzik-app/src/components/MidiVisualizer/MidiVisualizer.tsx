import React, { useContext, useEffect, useRef, useState } from 'react'
import './MidiVisualizer.scss'
import { MidiVisualizerSlide } from './MidiVisualizerSlide'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { useIntervalWorker } from '../../hooks'
import throttle from 'lodash/throttle'
import { AppContext } from '../_contexts'
import { SectionOfEvents, VisualizerEvent } from './types'
import { MidiVisualizerFactory } from './utils/MidiVisualizerFactory'

interface MidiVisualizerConfig {
    midiSpeedFactor?: number
    height: number
    width: number
    msPerSection: number
}

interface MidiVisualizerProps {
    data: SectionOfEvents[]
    config: MidiVisualizerConfig
}

export const BASE_CLASS = 'midi-visualizer'

const getMidiDuration = (data: SectionOfEvents[]) => {
    if (!data.length) return 0
    const lastSectionIndex = data.reduce(
        (acc, section) => Math.max(parseInt(Object.keys(section)[0]), acc),
        0
    )
    const lastEvents: VisualizerEvent[] = Object.values(data[lastSectionIndex])[0]
    return lastEvents.reduce((acc, event) => Math.max(event.startingTime + event.duration, acc), 0)
}

export const MidiVisualizer = WithContainerDimensions(function MidiVisualizer({
    config,
    data,
}: MidiVisualizerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [slidesEvents, setSlidesEvents] = useState<VisualizerEvent[][]>([])
    const [indexesToDraw, setIndexesToDraw] = useState([0, 1])
    const timeRef = useRef(0)
    const animRef = useRef<null | number>(null)
    const { intervalWorker } = useContext(AppContext)
    const { height, width, midiSpeedFactor = 1, msPerSection } = config
    const midiDuration = getMidiDuration(data)
    const midiVisualizerFactory = new MidiVisualizerFactory(height, msPerSection)

    const slides = ref.current?.getElementsByTagName('div')

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number, code: string) {
        timeRef.current = time
        if (shouldRedraw(time)) {
            reDraw(time)
        }
        if (['pause', 'stop', 'updateTimer'].includes(code)) {
            animateOnce(time)
        } else if (animRef.current === null && code === 'start') {
            animate(time)
        }
    }

    function animate(time: number, limit = false) {
        let startTime = 0
        let timeElapsed = 0
        function animationStep(timestamp: number) {
            if (!startTime) {
                startTime = timestamp
            }
            if (!timeElapsed) {
                timeElapsed = timestamp - startTime
            }

            const interval = timestamp - startTime
            const top = midiVisualizerFactory.getSlidesPercentageTop(
                time + timeElapsed / midiSpeedFactor
            )

            if (slides) {
                slides[0].style.transform = `translate3d(0, ${top[0]}, 0)`
                slides[1].style.transform = `translate3d(0, ${top[1]}, 0)`
            }

            if (limit) {
                stopAnimation()
            } else {
                startTime = timestamp
                timeElapsed = timeElapsed + interval
                animRef.current = window.requestAnimationFrame(animationStep)
            }
        }

        animRef.current = window.requestAnimationFrame(animationStep)
    }

    function stopAnimation() {
        if (animRef.current) {
            window.cancelAnimationFrame(animRef.current)
            animRef.current = null
        }
    }

    function shouldRedraw(time: number) {
        const newIndexesToDraw = midiVisualizerFactory.getIndexesSectionToDraw(time)
        return newIndexesToDraw[0] !== indexesToDraw[0] || newIndexesToDraw[1] !== indexesToDraw[1]
    }

    function reDraw(time: number) {
        const newIndexesToDraw = midiVisualizerFactory.getIndexesSectionToDraw(time)

        setSlidesEvents([
            midiVisualizerFactory.getEventsBySectionIndex(data, newIndexesToDraw[0]),
            midiVisualizerFactory.getEventsBySectionIndex(data, newIndexesToDraw[1]),
        ])

        setIndexesToDraw(newIndexesToDraw)
    }

    function animateOnce(time: number) {
        stopAnimation()
        animate(time, true)
    }

    useEffect(() => {
        const time = timeRef.current
        animateOnce(time)
        reDraw(time)
    }, [data])

    // @ts-ignore
    function onWheel(e: WheelEvent<HTMLDivElement>) {
        const onWheelCallback = () => {
            const { deltaY } = e
            const startAt = timeRef.current - deltaY
            const isValidTime = startAt >= 0 && startAt < midiDuration

            if (isValidTime) {
                intervalWorker?.updateTimer(timeRef.current + deltaY)
            }
        }

        throttle(onWheelCallback, 100)()
    }

    return (
        <div className={BASE_CLASS} ref={ref} aria-label={'visualizer'} onWheel={onWheel}>
            {[0, 1].map((index) => {
                return (
                    <MidiVisualizerSlide
                        index={index}
                        key={index}
                        events={slidesEvents[index]}
                        height={height}
                        width={width}
                    />
                )
            })}
        </div>
    )
})
