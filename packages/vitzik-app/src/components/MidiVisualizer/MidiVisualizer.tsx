import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { MidiVisualizerFactory, MidiVisualizerNoteEvent } from './utils'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../../utils/const'
import { LoopEditor } from './LoopEditor'
import { MidiEventsManager } from './MidiEventsManager'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'
import { isEven } from '../../utils'

interface MidiVisualizerProps {
    activeInstruments: Instrument[]
    midiFile: IMidiFile
    midiMode?: MidiPlayMode
    loopTimestamps?: LoopTimestamps
    isEditingLoop?: boolean
    midiMetas: MidiMetas
    activeTracks: number[]
    height?: number
    timeToNextNote: number | null
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

const MS_PER_SECTION = 2000
export const BASE_CLASS = 'midi-visualizer'
export const isUserChannel = (channel: number) =>
    [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)

export const MidiVisualizer = WithContainerDimensions(function MidiVisualizer({
    activeInstruments,
    midiMode = 'autoplay',
    midiFile,
    loopTimestamps,
    isEditingLoop,
    midiMetas,
    activeTracks,
    timeToNextNote,
    height = 0,
    width = 0,
    onChangeActiveNotes,
    onChangeInstruments,
    onChangeTimeToNextNote,
    onChangeLoopTimes,
    onChangeAudioPlayerState,
}: MidiVisualizerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [sectionCoordinates, setSectionCoordinates] = useState<MidiVisualizerNoteEvent[][]>([])
    const prevIndexToDraw = useRef({ slide0: 0, slide1: 1 })
    const timeRef = useRef(0)

    const slides = ref.current?.getElementsByTagName('div')

    const midiVisualizerFactory = useMemo(
        () => new MidiVisualizerFactory({ height, width }, MS_PER_SECTION, midiMetas),
        [height, midiMetas, width]
    )

    const notesCoordinates = useMemo(
        () => midiVisualizerFactory.getNotesCoordinates(midiFile),
        [midiVisualizerFactory, midiFile]
    )

    useIntervalWorker(onTimeChange)

    const activeTracksCoordinates = useMemo(
        () => MidiVisualizerFactory.mergeNotesCoordinates(activeTracks, notesCoordinates),
        [notesCoordinates, activeTracks]
    )

    useEffect(() => {
        if (ref.current && height && width) {
            redrawVisualization(true)
        }
    }, [height, width, ref.current])

    useEffect(() => {
        redrawVisualization(true)
    }, [activeTracks])

    const getCoordinates = (time: number, forceUpdate: boolean = false) => {
        const indexToDraw = midiVisualizerFactory.getIndexesSectionToDraw(time)
        const indexToDrawHasChanged =
            indexToDraw.slide0 !== prevIndexToDraw.current.slide0 ||
            indexToDraw.slide1 !== prevIndexToDraw.current.slide1

        if (indexToDrawHasChanged || forceUpdate) {
            setSectionCoordinates([
                MidiVisualizerFactory.getSectionCoordinates(
                    activeTracksCoordinates,
                    indexToDraw.slide0,
                    height
                ),
                MidiVisualizerFactory.getSectionCoordinates(
                    activeTracksCoordinates,
                    indexToDraw.slide1,
                    height
                ),
            ])
        }

        prevIndexToDraw.current = indexToDraw
    }

    const animate = (time: number) => {
        function animationStep() {
            const top = midiVisualizerFactory.getSlidesPercentageTop(time)

            if (slides) {
                slides[0].style.transform = `translate3d(0, ${top[0]}, 0)`
                slides[1].style.transform = `translate3d(0, ${top[1]}, 0)`
            }
        }

        window.requestAnimationFrame(animationStep)
    }

    function swapSlidesZIndexes(time: number) {
        const indexSectionPlaying = midiVisualizerFactory.getIndexSectionPlaying(time)
        const isIndexSectionEven = isEven(indexSectionPlaying)
        const isMovingForward = timeRef.current < time

        if (slides && isMovingForward) {
            slides[1].style.zIndex = isIndexSectionEven ? '-2' : '2'
            slides[0].style.zIndex = isIndexSectionEven ? '2' : '-2'
        } else if (slides) {
            slides[1].style.zIndex = isIndexSectionEven ? '2' : '-2'
            slides[0].style.zIndex = isIndexSectionEven ? '-2' : '2'
        }
    }

    function onTimeChange(time: number) {
        swapSlidesZIndexes(time)
        timeRef.current = time
        redrawVisualization()
    }

    function redrawVisualization(forceUpdate = false) {
        animate(timeRef.current)
        getCoordinates(timeRef.current, forceUpdate)
    }

    if (!height || !width) return null

    return (
        <div className={BASE_CLASS} ref={ref} aria-label={'visualizer'}>
            {[0, 1].map((index) => {
                return (
                    <MidiVisualizerSlide
                        index={index}
                        key={index}
                        notesCoordinates={sectionCoordinates[index]}
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
                timeToNextNote={timeToNextNote}
                midiMode={midiMode}
                midiMetas={midiMetas}
                loopTimestamps={loopTimestamps}
                midiVisualizerFactory={midiVisualizerFactory}
                activeInstruments={activeInstruments}
                activeTracksCoordinates={activeTracksCoordinates}
                onChangeActiveNotes={onChangeActiveNotes}
                onChangeInstruments={onChangeInstruments}
                onChangeTimeToNextNote={onChangeTimeToNextNote}
                onChangeAudioPlayerState={onChangeAudioPlayerState}
            />
        </div>
    )
})
