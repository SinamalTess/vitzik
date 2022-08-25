import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import './MidiVisualizer.scss'
import {
    Instrument,
    ActiveNote,
    MidiMetas,
    MidiPlayMode,
    LoopTimestamps,
    AudioPlayerState,
} from '../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { MidiVisualizerSlide } from './MidiVisualizerSlide'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { VisualizerFactory } from './utils'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../../utils/const'
import { LoopEditor } from './LoopEditor'
import { MidiEventsManager } from './MidiEventsManager'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'
import throttle from 'lodash/throttle'
import { AppContext } from '../_contexts'
import { VisualizerEvent } from './types'

interface MidiVisualizerProps {
    activeInstruments: Instrument[]
    midiFile: IMidiFile
    midiPlayMode?: MidiPlayMode
    loopTimestamps?: LoopTimestamps
    isEditingLoop?: boolean
    midiMetas: MidiMetas
    activeTracks: number[]
    height?: number
    midiSpeedFactor?: number
    nextNoteStartingTime: number | null
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

const MS_PER_SECTION = 2000
export const BASE_CLASS = 'midi-visualizer'
export const isUserChannel = (channel: number) =>
    [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)

export const MidiVisualizer = WithContainerDimensions(function MidiVisualizer({
    activeInstruments,
    midiPlayMode = 'autoplay',
    midiFile,
    loopTimestamps,
    isEditingLoop,
    midiSpeedFactor = 1,
    midiMetas,
    activeTracks,
    nextNoteStartingTime,
    height = 0,
    width = 0,
    onChangeActiveNotes,
    onChangeInstruments,
    onChangeNextNoteStartingTime,
    onChangeLoopTimes,
    onChangeAudioPlayerState,
}: MidiVisualizerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [slidesEvents, setSlidesEvents] = useState<VisualizerEvent[][]>([])
    const [indexesToDraw, setIndexesToDraw] = useState([0, 1])
    const timeRef = useRef(0)
    const animRef = useRef<null | number>(null)
    const { intervalWorker } = useContext(AppContext)

    const slides = ref.current?.getElementsByTagName('div')

    const visualizerFactory = useMemo(
        () => new VisualizerFactory({ height, width }, MS_PER_SECTION, midiMetas, midiFile),
        [height, midiMetas, width]
    )

    const activeTracksEvents = useMemo(() => {
        visualizerFactory.clearLoopTimeStampEvents()
        if (loopTimestamps) {
            const [startLoop, endLoop] = loopTimestamps
            if (startLoop) {
                visualizerFactory.addLoopTimeStampEvent(startLoop)
            }
            if (endLoop) {
                visualizerFactory.addLoopTimeStampEvent(endLoop)
            }
        }
        return visualizerFactory.getEventsForTracks(activeTracks)
    }, [activeTracks, visualizerFactory, loopTimestamps])

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number, code: string) {
        timeRef.current = time
        if (shouldRedraw(time)) {
            reDraw(time)
        }
        if (['pause', 'stop', 'updateTimer'].includes(code)) {
            animationOnce(time)
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

            console.log(midiSpeedFactor)

            const interval = timestamp - startTime
            const top = visualizerFactory.getSlidesPercentageTop(
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
        const newIndexesToDraw = visualizerFactory.getIndexesSectionToDraw(time)
        return newIndexesToDraw[0] !== indexesToDraw[0] || newIndexesToDraw[1] !== indexesToDraw[1]
    }

    function reDraw(time: number) {
        const newIndexesToDraw = visualizerFactory.getIndexesSectionToDraw(time)

        setSlidesEvents([
            visualizerFactory.getEventsBySectionIndex(activeTracksEvents, newIndexesToDraw[0]),
            visualizerFactory.getEventsBySectionIndex(activeTracksEvents, newIndexesToDraw[1]),
        ])

        setIndexesToDraw(newIndexesToDraw)
    }

    function animationOnce(time: number) {
        stopAnimation()
        animate(time, true)
    }

    useEffect(() => {
        const time = timeRef.current
        animationOnce(time)
        reDraw(time)
    }, [activeTracks, loopTimestamps, height, width, ref.current, midiSpeedFactor])

    // @ts-ignore
    function onWheel(e: WheelEvent<HTMLDivElement>) {
        const onWheelCallback = () => {
            const { deltaY } = e
            const { midiDuration } = midiMetas
            const startAt = timeRef.current + deltaY
            const isValidTime = startAt >= 0 && startAt < midiDuration

            if (isValidTime) {
                intervalWorker?.updateTimer(timeRef.current + deltaY)
            }
        }

        throttle(onWheelCallback, 100)()
    }

    if (!height || !width) return null

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
            {isEditingLoop && loopTimestamps ? (
                <LoopEditor
                    loopTimestamps={loopTimestamps}
                    width={width}
                    height={height}
                    msPerSection={MS_PER_SECTION}
                    onChangeLoopTimestamps={onChangeLoopTimes}
                />
            ) : null}
            <MidiEventsManager
                nextNoteStartingTime={nextNoteStartingTime}
                midiPlayMode={midiPlayMode}
                midiMetas={midiMetas}
                loopTimestamps={loopTimestamps}
                visualizerFactory={visualizerFactory}
                activeInstruments={activeInstruments}
                activeTracksNoteEvents={activeTracksEvents}
                onChangeActiveNotes={onChangeActiveNotes}
                onChangeInstruments={onChangeInstruments}
                onChangeNextNoteStartingTime={onChangeNextNoteStartingTime}
                onChangeAudioPlayerState={onChangeAudioPlayerState}
            />
        </div>
    )
})
