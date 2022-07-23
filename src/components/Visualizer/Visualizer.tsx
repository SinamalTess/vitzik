import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './Visualizer.scss'
import {
    ActiveNote,
    AudioPlayerState,
    Instrument,
    MidiMetas,
    MidiMode,
    MidiVisualizerNoteCoordinates,
} from '../../types'
import { findLast, isEqual } from 'lodash'
import { IMidiFile } from 'midi-json-parser-worker'
import { VisualizerSection } from './VisualizerSection'
import { VisualizerNotesTracks } from './VisualizerNotesTracks'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { getSectionCoordinates, init, mergeNotesCoordinates } from './MidiVisualizerCoordinates'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../../utils/const'
import { LoopEditor } from './LoopEditor'
import { LoopTimes } from '../../types/LoopTimes'

interface VisualizerProps {
    worker: Worker
    activeInstruments: Instrument[]
    midiFile: IMidiFile
    midiMode?: MidiMode
    loopTimes?: LoopTimes
    isEditingLoop?: boolean
    midiMetas: MidiMetas
    audioPlayerState: AudioPlayerState
    activeTracks: number[]
    height?: number
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimes>>
}

const MS_PER_SECTION = 2000
export const BASE_CLASS = 'visualizer'

export const Visualizer = WithContainerDimensions(
    ({
        worker,
        activeInstruments,
        midiMode = 'autoplay',
        midiFile,
        loopTimes,
        isEditingLoop,
        midiMetas,
        audioPlayerState,
        activeTracks,
        height = 0,
        width = 0,
        onChangeActiveNotes,
        onChangeInstruments,
        onChangeTimeToNextNote,
        onChangeLoopTimes,
    }: VisualizerProps) => {
        const svgRef = useRef<HTMLDivElement>(null)
        let animation = useRef<number>(0)
        const [coordinates, setCoordinates] = useState<MidiVisualizerNoteCoordinates[][]>([])

        const coordinatesFactory = useMemo(
            () => init(midiMetas, height, width, MS_PER_SECTION),
            [height, midiMetas, width]
        )

        const allCoordinates = useMemo(
            () => coordinatesFactory.getNotesCoordinates(midiFile),
            [coordinatesFactory, midiFile]
        )

        const activeTracksCoordinates = useMemo(
            () => mergeNotesCoordinates(activeTracks, allCoordinates),
            [allCoordinates, activeTracks]
        )

        const updateInstruments = useCallback(
            (time: number) => {
                const newInstruments = activeInstruments.map((activeInstrument) => {
                    const sameChannelInstruments = midiMetas.instruments.filter(
                        (instrument) => instrument.channel === activeInstrument.channel
                    )
                    if (sameChannelInstruments.length) {
                        return (
                            findLast(
                                sameChannelInstruments,
                                (sameChannelInstrument) => sameChannelInstrument.timestamp <= time
                            ) ?? activeInstrument
                        )
                    }
                    return activeInstrument
                })

                if (!isEqual(newInstruments, activeInstruments)) {
                    onChangeInstruments(newInstruments)
                }
            },
            [activeInstruments, midiMetas.instruments, onChangeInstruments]
        )

        const updateTimeToNextNote = useCallback(
            (time: number) => {
                if (midiMode === 'wait') {
                    const timeToNextNote = coordinatesFactory.getTimeToNextNote(
                        activeTracksCoordinates,
                        time
                    )
                    onChangeTimeToNextNote(timeToNextNote)
                }
            },
            [midiMode, coordinatesFactory, activeTracksCoordinates, onChangeTimeToNextNote]
        )

        const updateActiveNotes = useCallback(
            (time: number) => {
                const newActiveNotes = coordinatesFactory.getActiveNotes(
                    activeTracksCoordinates,
                    time
                )

                onChangeActiveNotes((activeNotes: ActiveNote[]) => {
                    const midiInputNotes = activeNotes.filter(({ channel }) =>
                        [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)
                    )
                    return isEqual(newActiveNotes, activeNotes)
                        ? activeNotes
                        : [...newActiveNotes, ...midiInputNotes]
                })
            },
            [coordinatesFactory, activeTracksCoordinates, onChangeActiveNotes]
        )

        const calcCoordinates = useCallback(
            (time: number) => {
                const indexToDraw = coordinatesFactory.getIndexToDraw(time, audioPlayerState)

                setCoordinates([
                    getSectionCoordinates(activeTracksCoordinates, indexToDraw[0], height),
                    getSectionCoordinates(activeTracksCoordinates, indexToDraw[1], height),
                ])
            },
            [activeTracksCoordinates, audioPlayerState, coordinatesFactory, height]
        )

        const animate = useCallback(
            (time: number) => {
                function animationStep() {
                    const top = coordinatesFactory.getPercentageTopSection(time)
                    const svgs = svgRef.current?.getElementsByTagName('svg')

                    if (svgs) {
                        svgs[0].style.transform = `scaleY(-1) translateY(${top[0]})`
                        svgs[1].style.transform = `scaleY(-1) translateY(${top[1]})`
                    }
                }

                animation.current = window.requestAnimationFrame(animationStep)
            },
            [coordinatesFactory]
        )

        useEffect(() => {
            function onTimeChange(message: MessageEvent) {
                const { time } = message.data
                animate(time)
                calcCoordinates(time)
                updateActiveNotes(time)
                updateTimeToNextNote(time)
                updateInstruments(time)
            }

            worker.addEventListener('message', onTimeChange)

            return function cleanup() {
                worker.removeEventListener('message', onTimeChange)
            }
        }, [
            animate,
            calcCoordinates,
            updateActiveNotes,
            updateInstruments,
            updateTimeToNextNote,
            worker,
        ])

        if (!height || !width) return null

        return (
            <div className={BASE_CLASS} ref={svgRef} aria-label={'visualizer'}>
                {[0, 1].map((index) => {
                    return (
                        <VisualizerSection
                            index={index}
                            key={index}
                            notesCoordinates={coordinates[index]}
                            height={height}
                            width={width}
                        />
                    )
                })}
                <VisualizerNotesTracks height={height} width={width} />
                {isEditingLoop && loopTimes ? (
                    <LoopEditor
                        worker={worker}
                        loopTimes={loopTimes}
                        width={width}
                        height={height}
                        msPerSection={MS_PER_SECTION}
                        onChangeLoopTimes={onChangeLoopTimes}
                    />
                ) : null}
            </div>
        )
    }
)
