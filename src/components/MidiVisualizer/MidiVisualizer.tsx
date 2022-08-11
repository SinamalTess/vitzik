import React, { useEffect, useMemo, useRef, useState } from 'react'
import './MidiVisualizer.scss'
import {
    Instrument,
    ActiveNote,
    MidiMetas,
    MidiMode,
    MidiVisualizerNoteCoordinates,
    LoopTimestamps,
} from '../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { MidiVisualizerSection } from './MidiVisualizerSection'
import { MidiVisualizerVerticalLines } from './MidiVisualizerVerticalLines'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { MidiVisualizerFactory } from './MidiVisualizerFactory'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../../utils/const'
import { LoopEditor } from './LoopEditor'
import { MidiEventsManager } from './MidiEventsManager'

interface MidiVisualizerProps {
    intervalWorker: Worker
    activeInstruments: Instrument[]
    midiFile: IMidiFile
    midiMode?: MidiMode
    loopTimestamps?: LoopTimestamps
    isEditingLoop?: boolean
    midiMetas: MidiMetas
    activeTracks: number[]
    height?: number
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimestamps>>
}

const MS_PER_SECTION = 2000
export const BASE_CLASS = 'midi-visualizer'
export const isUserChannel = (channel: number) =>
    [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)

export const MidiVisualizer = WithContainerDimensions(function MidiVisualizer({
    intervalWorker,
    activeInstruments,
    midiMode = 'autoplay',
    midiFile,
    loopTimestamps,
    isEditingLoop,
    midiMetas,
    activeTracks,
    height = 0,
    width = 0,
    onChangeActiveNotes,
    onChangeInstruments,
    onChangeTimeToNextNote,
    onChangeLoopTimes,
}: MidiVisualizerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [sectionCoordinates, setSectionCoordinates] = useState<MidiVisualizerNoteCoordinates[][]>(
        []
    )

    const svgs = ref.current?.getElementsByTagName('svg')

    const midiVisualizerFactory = useMemo(
        () => new MidiVisualizerFactory(midiMetas, height, width, MS_PER_SECTION),
        [height, midiMetas, width]
    )

    const notesCoordinates = useMemo(
        () => midiVisualizerFactory.getNotesCoordinates(midiFile),
        [midiVisualizerFactory, midiFile]
    )

    const activeTracksCoordinates = useMemo(
        () => MidiVisualizerFactory.mergeNotesCoordinates(activeTracks, notesCoordinates),
        [notesCoordinates, activeTracks]
    )

    useEffect(() => {
        if (ref.current && height && width) {
            redrawVisualization()
        }
    }, [height, width, ref.current])

    useEffect(() => {
        const getCoordinates = (time: number) => {
            const indexToDraw = midiVisualizerFactory.getIndexToDraw(time)

            setSectionCoordinates([
                MidiVisualizerFactory.getSectionCoordinates(
                    activeTracksCoordinates,
                    indexToDraw[0],
                    height
                ),
                MidiVisualizerFactory.getSectionCoordinates(
                    activeTracksCoordinates,
                    indexToDraw[1],
                    height
                ),
            ])
        }

        const animate = (time: number) => {
            function animationStep() {
                const top = midiVisualizerFactory.getPercentageTopSection(time)

                if (svgs) {
                    svgs[0].style.transform = `translateY(${top[0]})`
                    svgs[1].style.transform = `translateY(${top[1]})`
                }
            }

            window.requestAnimationFrame(animationStep)
        }

        function onTimeChange(message: MessageEvent) {
            const { time } = message.data
            animate(time)
            getCoordinates(time)
        }

        intervalWorker.addEventListener('message', onTimeChange)

        return function cleanup() {
            intervalWorker.removeEventListener('message', onTimeChange)
        }
    }, [activeTracksCoordinates, height, intervalWorker, midiVisualizerFactory, svgs])

    function redrawVisualization() {
        intervalWorker.postMessage({ code: 'getTime' })
    }

    if (!height || !width) return null

    return (
        <div className={BASE_CLASS} ref={ref} aria-label={'visualizer'}>
            {[0, 1].map((index) => {
                return (
                    <MidiVisualizerSection
                        index={index}
                        key={index}
                        notesCoordinates={sectionCoordinates[index]}
                        height={height}
                        width={width}
                    />
                )
            })}
            <MidiVisualizerVerticalLines height={height} width={width} />
            {isEditingLoop && loopTimestamps ? (
                <LoopEditor
                    intervalWorker={intervalWorker}
                    loopTimestamps={loopTimestamps}
                    width={width}
                    height={height}
                    msPerSection={MS_PER_SECTION}
                    onChangeLoopTimestamps={onChangeLoopTimes}
                />
            ) : null}
            <MidiEventsManager
                intervalWorker={intervalWorker}
                midiMode={midiMode}
                midiMetas={midiMetas}
                midiVisualizerFactory={midiVisualizerFactory}
                activeInstruments={activeInstruments}
                activeTracksCoordinates={activeTracksCoordinates}
                onChangeActiveNotes={onChangeActiveNotes}
                onChangeInstruments={onChangeInstruments}
                onChangeTimeToNextNote={onChangeTimeToNextNote}
            />
        </div>
    )
})
