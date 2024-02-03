import React, { useEffect, useRef, useState } from 'react'
import './Visualizer.scss'
import { Slide } from '../Slide'
import { WithContainerDimensions } from '../../../_hocs/WithContainerDimensions'
import { useIntervalWorker } from '@/hooks'
import { VisualizerEvent } from '../../types'
import { AnimationFactory } from '../../factories/AnimationFactory'
import { Section } from '../../classes/Section'
import { MidiVisualizerConfig } from '@/types/MidiVisualizerConfig'

interface VisualizerProps {
    data: Section[]
    config: MidiVisualizerConfig
    onWheel: (e: WheelEvent) => void
}

export const BASE_CLASS = 'midi-visualizer'

export const Visualizer = WithContainerDimensions(function MidiVisualizer({
    config,
    data,
    onWheel,
}: VisualizerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { timeRef, intervalWorker } = useIntervalWorker(onTimeChange)
    const animRef = useRef<null | number>(null)
    const [slidesEvents, setSlidesEvents] = useState<VisualizerEvent[][]>([])
    const [indexesToDraw, setIndexesToDraw] = useState([0, 1])
    const { height, midiSpeedFactor = 1, msPerSection } = config
    const midiVisualizerFactory = new AnimationFactory(height, msPerSection)
    const slides = ref.current?.getElementsByTagName('div')

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number, code: string) {
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

    return (
        // @ts-ignore
        <div className={BASE_CLASS} ref={ref} aria-label={'visualizer'} onWheel={onWheel}>
            {[0, 1].map((index) => {
                return (
                    <Slide config={config} index={index} key={index} events={slidesEvents[index]} />
                )
            })}
        </div>
    )
})
