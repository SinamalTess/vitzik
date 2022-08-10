import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './MidiVisualizer.scss'
import {
    Instrument,
    ActiveNote,
    AudioPlayerState,
    MidiMetas,
    MidiMode,
    MidiVisualizerNoteCoordinates,
    LoopTimestamps,
} from '../../types'
import isEqual from 'lodash/isEqual'
import uniqBy from 'lodash/uniqBy'
import { IMidiFile } from 'midi-json-parser-worker'
import { MidiVisualizerSection } from './MidiVisualizerSection'
import { MidiVisualizerNotesTracks } from './MidiVisualizerNotesTracks'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { getSectionCoordinates, init, mergeNotesCoordinates } from './MidiVisualizerFactory'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../../utils/const'
import { LoopEditor } from './LoopEditor'

interface MidiVisualizerProps {
    intervalWorker: Worker
    activeInstruments: Instrument[]
    midiFile: IMidiFile
    midiMode?: MidiMode
    loopTimestamps?: LoopTimestamps
    isEditingLoop?: boolean
    midiMetas: MidiMetas
    audioPlayerState: AudioPlayerState
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

export const MidiVisualizer = WithContainerDimensions(
    ({
        intervalWorker,
        activeInstruments,
        midiMode = 'autoplay',
        midiFile,
        loopTimestamps,
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
    }: MidiVisualizerProps) => {
        const svgRef = useRef<HTMLDivElement>(null)
        let animation = useRef<number>(0)
        const [coordinates, setCoordinates] = useState<MidiVisualizerNoteCoordinates[][]>([])
        const midiTrackInstruments = activeInstruments.filter(
            ({ channel }) => !isUserChannel(channel)
        )
        const { instruments } = midiMetas
        const isMultiInstrumentsTrack = instruments.some(({ timestamp }) => timestamp > 0)
        const svgs = svgRef.current?.getElementsByTagName('svg')

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
                const allInstruments = [...instruments]
                    .filter(({ timestamp }) => timestamp <= time)
                    .sort((a, b) => b.delta - a.delta) // sort by largest delta first

                const newInstruments = uniqBy(allInstruments, 'channel')

                if (!isEqual(newInstruments, midiTrackInstruments)) {
                    onChangeInstruments(newInstruments)
                }
            },
            [activeInstruments, midiMetas.instruments, onChangeInstruments]
        )

        const setTimeToNextNote = useCallback(
            (time: number) => {
                const timeToNextNote = coordinatesFactory.getTimeToNextNote(
                    activeTracksCoordinates,
                    time
                )
                onChangeTimeToNextNote(timeToNextNote)
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
                    if (isEqual(newActiveNotes, activeNotes)) {
                        return activeNotes
                    } else {
                        const userNotes = activeNotes.filter(({ channel }) =>
                            isUserChannel(channel)
                        )
                        return [...newActiveNotes, ...userNotes]
                    }
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

                    if (svgs) {
                        svgs[0].style.transform = `translateY(${top[0]})`
                        svgs[1].style.transform = `translateY(${top[1]})`
                    }
                }

                animation.current = window.requestAnimationFrame(animationStep)
            },
            [coordinatesFactory, svgs]
        )

        useEffect(() => {
            function onTimeChange(message: MessageEvent) {
                const { time } = message.data
                animate(time)
                calcCoordinates(time)
                updateActiveNotes(time)
                if (midiMode === 'wait') {
                    setTimeToNextNote(time)
                }
                if (isMultiInstrumentsTrack) {
                    updateInstruments(time)
                }
            }

            intervalWorker.addEventListener('message', onTimeChange)

            return function cleanup() {
                intervalWorker.removeEventListener('message', onTimeChange)
            }
        }, [
            animate,
            calcCoordinates,
            updateActiveNotes,
            updateInstruments,
            setTimeToNextNote,
            intervalWorker,
        ])

        if (!height || !width) return null

        return (
            <div className={BASE_CLASS} ref={svgRef} aria-label={'visualizer'}>
                {[0, 1].map((index) => {
                    return (
                        <MidiVisualizerSection
                            index={index}
                            key={index}
                            notesCoordinates={coordinates[index]}
                            height={height}
                            width={width}
                        />
                    )
                })}
                <MidiVisualizerNotesTracks height={height} width={width} />
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
            </div>
        )
    }
)
