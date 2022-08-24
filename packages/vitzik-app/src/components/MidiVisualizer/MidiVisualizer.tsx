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
import { isEven } from '../../utils'
import throttle from 'lodash/throttle'
import { AppContext } from '../_contexts'
import { VisualizerNoteEvent } from './types'

interface MidiVisualizerProps {
    activeInstruments: Instrument[]
    midiFile: IMidiFile
    midiPlayMode?: MidiPlayMode
    loopTimestamps?: LoopTimestamps
    isEditingLoop?: boolean
    midiMetas: MidiMetas
    activeTracks: number[]
    height?: number
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
    const [sectionNoteEvents, setSectionNoteEvents] = useState<VisualizerNoteEvent[][]>([])
    const [topSlide, setTopSlide] = useState([true, false])
    const { intervalWorker } = useContext(AppContext)
    const prevIndexToDraw = useRef({ slide0: 0, slide1: 1 })
    const timeRef = useRef(0)

    const slides = ref.current?.getElementsByTagName('div')

    const visualizerFactory = useMemo(
        () => new VisualizerFactory({ height, width }, MS_PER_SECTION, midiMetas),
        [height, midiMetas, width]
    )

    const noteEvents = useMemo(
        () => visualizerFactory.getVisualizerNoteEvents(midiFile),
        [visualizerFactory, midiFile]
    )

    const activeTracksNoteEvents = useMemo(
        () => VisualizerFactory.getActiveTracksNoteEvents(activeTracks, noteEvents),
        [noteEvents, activeTracks]
    )

    useIntervalWorker(onTimeChange)

    useEffect(() => {
        if (ref.current && height && width) {
            redrawVisualization(true)
        }
    }, [height, width, ref.current])

    useEffect(() => {
        redrawVisualization(true)
    }, [activeTracks])

    const getCoordinates = (time: number, forceUpdate: boolean = false) => {
        const indexToDraw = visualizerFactory.getIndexesSectionToDraw(time)
        const indexToDrawHasChanged =
            indexToDraw.slide0 !== prevIndexToDraw.current.slide0 ||
            indexToDraw.slide1 !== prevIndexToDraw.current.slide1

        if (indexToDrawHasChanged || forceUpdate) {
            setSectionNoteEvents([
                visualizerFactory.getNoteEventsBySectionIndex(
                    activeTracksNoteEvents,
                    indexToDraw.slide0
                ),
                visualizerFactory.getNoteEventsBySectionIndex(
                    activeTracksNoteEvents,
                    indexToDraw.slide1
                ),
            ])
        }

        prevIndexToDraw.current = indexToDraw
    }

    const animate = (time: number) => {
        function animationStep() {
            const top = visualizerFactory.getSlidesPercentageTop(time)

            if (slides) {
                slides[0].style.transform = `translate3d(0, ${top[0]}, 0)`
                slides[1].style.transform = `translate3d(0, ${top[1]}, 0)`
            }
        }

        window.requestAnimationFrame(animationStep)
    }

    function onTimeChange(time: number) {
        checkTopSlide(time)
        timeRef.current = time
        redrawVisualization()
    }

    function redrawVisualization(forceUpdate = false) {
        animate(timeRef.current)
        getCoordinates(timeRef.current, forceUpdate)
    }

    function checkTopSlide(time: number) {
        const indexSectionPlaying = visualizerFactory.getIndexSectionPlaying(time)
        const isIndexSectionPlayingEven = isEven(indexSectionPlaying)

        setTopSlide([isIndexSectionPlayingEven, !isIndexSectionPlayingEven])
    }

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
                        noteEvents={sectionNoteEvents[index]}
                        height={height}
                        width={width}
                        isTopSlide={topSlide[index]}
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
                activeTracksNoteEvents={activeTracksNoteEvents}
                onChangeActiveNotes={onChangeActiveNotes}
                onChangeInstruments={onChangeInstruments}
                onChangeNextNoteStartingTime={onChangeNextNoteStartingTime}
                onChangeAudioPlayerState={onChangeAudioPlayerState}
            />
        </div>
    )
})
