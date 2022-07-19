import React, { useContext, useEffect, useMemo, useRef } from 'react'
import './Visualizer.scss'
import { ActiveNote, AudioPlayerState, Instrument, MidiMetas, MidiMode } from '../../types'
import { findLast, isEqual } from 'lodash'
import { IMidiFile } from 'midi-json-parser-worker'
import { VisualizerSection } from './VisualizerSection'
import { VisualizerNotesTracks } from './VisualizerNotesTracks'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { getSectionCoordinates, init, mergeNotesCoordinates } from './MidiVisualizerCoordinates'
import { MidiCurrentTime } from '../TimeContextProvider/TimeContextProvider'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../../utils/const'
import { LoopEditor } from './LoopEditor'
import { LoopTimes } from '../../types/LoopTimes'

interface VisualizerProps {
    activeInstruments: Instrument[]
    midiFile: IMidiFile
    midiMode: MidiMode
    loopTimes: LoopTimes
    isEditingLoop: boolean
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

export const Visualizer = WithContainerDimensions(
    ({
        activeInstruments,
        midiMode,
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
        const ref = useRef<HTMLDivElement>(null)
        let animation = useRef<number>(0)
        const midiCurrentTime = useContext(MidiCurrentTime)

        const midiVisualizerCoordinates = useMemo(
            () => init(midiMetas, height, width, MS_PER_SECTION),
            [height, midiMetas, width]
        )

        const allNotesCoordinates = useMemo(
            () => midiVisualizerCoordinates.getNotesCoordinates(midiFile),
            [midiVisualizerCoordinates, midiFile]
        )

        const notesCoordinates = useMemo(
            () => mergeNotesCoordinates(activeTracks, allNotesCoordinates),
            [allNotesCoordinates, activeTracks]
        )

        const indexToDraw: { [key: number]: number } = midiVisualizerCoordinates.getIndexToDraw(
            midiCurrentTime,
            audioPlayerState
        )

        const coordinates = [
            getSectionCoordinates(notesCoordinates, indexToDraw[0]),
            getSectionCoordinates(notesCoordinates, indexToDraw[1]),
        ]

        useEffect(() => {
            function animationStep() {
                const top = midiVisualizerCoordinates.getPercentageTopSection(midiCurrentTime)
                const svgs = ref.current?.getElementsByTagName('svg')

                if (svgs) {
                    svgs[0].style.transform = `scaleY(-1) translateY(${top[0]})`
                    svgs[1].style.transform = `scaleY(-1) translateY(${top[1]})`
                }
            }

            function updateActiveNotes() {
                const newActiveNotes = midiVisualizerCoordinates.getActiveNotes(
                    notesCoordinates,
                    midiCurrentTime
                )

                onChangeActiveNotes((activeNotes: ActiveNote[]) => {
                    const midiInputNotes = activeNotes.filter(({ channel }) =>
                        [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)
                    )
                    return isEqual(newActiveNotes, activeNotes)
                        ? activeNotes
                        : [...newActiveNotes, ...midiInputNotes]
                })
            }

            function updateTimeToNextNote() {
                if (midiMode === 'wait') {
                    const timeToNextNote = midiVisualizerCoordinates.getTimeToNextNote(
                        notesCoordinates,
                        midiCurrentTime
                    )
                    onChangeTimeToNextNote(timeToNextNote)
                }
            }

            animation.current = window.requestAnimationFrame(animationStep)
            updateActiveNotes()
            updateTimeToNextNote()
        }, [
            midiCurrentTime,
            midiMode,
            midiVisualizerCoordinates,
            notesCoordinates,
            onChangeActiveNotes,
            onChangeTimeToNextNote,
        ])

        useEffect(() => {
            function updateInstruments() {
                const newInstruments = activeInstruments.map((activeInstrument) => {
                    const sameChannelInstruments = midiMetas.instruments.filter(
                        (instrument) => instrument.channel === activeInstrument.channel
                    )
                    if (sameChannelInstruments.length) {
                        return (
                            findLast(
                                sameChannelInstruments,
                                (sameChannelInstrument) =>
                                    sameChannelInstrument.timestamp <= midiCurrentTime
                            ) ?? activeInstrument
                        )
                    }
                    return activeInstrument
                })

                if (!isEqual(newInstruments, activeInstruments)) {
                    onChangeInstruments(newInstruments)
                    console.log('Updated instruments')
                }
            }

            updateInstruments()
        }, [activeInstruments, midiCurrentTime, midiMetas.instruments, onChangeInstruments])

        if (!height || !width) return null

        return (
            <div className="visualizer" ref={ref}>
                {[0, 1].map((index) => {
                    return (
                        <VisualizerSection
                            index={index}
                            key={index}
                            indexToDraw={indexToDraw[index]}
                            notesCoordinates={coordinates[index]}
                            height={height}
                            width={width}
                        />
                    )
                })}
                <VisualizerNotesTracks height={height} width={width} />
                {isEditingLoop ? (
                    <LoopEditor
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
