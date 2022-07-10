import React, { useEffect, useMemo, useRef } from 'react'
import './Visualizer.scss'
import { AudioPlayerState, MidiMetas, ActiveNote, MidiMode } from '../../types'
import isEqual from 'lodash.isequal'
import { IMidiFile } from 'midi-json-parser-worker'
import { VisualizerSection } from './VisualizerSection'
import { VisualizerNotesTracks } from './VisualizerNotesTracks'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { MidiVisualizerCoordinates } from './MidiVisualizerCoordinates'

interface VisualizerProps {
    midiCurrentTime: number
    midiFile: IMidiFile
    midiMode: MidiMode
    midiMetas: MidiMetas
    audioPlayerState: AudioPlayerState
    activeTracks: number[]
    height?: number
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
}

export const Visualizer = WithContainerDimensions(
    ({
        midiCurrentTime,
        midiMode,
        midiFile,
        midiMetas,
        audioPlayerState,
        activeTracks,
        height = 0,
        width = 0,
        onChangeActiveNotes,
        onChangeTimeToNextNote,
    }: VisualizerProps) => {
        if (!height || !width) return null
        const ref = useRef<HTMLDivElement>(null)
        let animation = useRef<number>(0)

        const midiVisualizerCoordinates = useMemo(
            () =>
                new MidiVisualizerCoordinates(midiMetas, {
                    w: width,
                    h: height,
                }),
            [height, midiMetas, width]
        )

        const allNotesCoordinates = useMemo(
            () => midiVisualizerCoordinates.getNotesCoordinates(midiFile),
            [midiVisualizerCoordinates, midiFile]
        )

        const notesCoordinates = useMemo(
            () =>
                MidiVisualizerCoordinates.mergeNotesCoordinates(activeTracks, allNotesCoordinates),
            [allNotesCoordinates, activeTracks]
        )

        const indexSectionPlaying =
            midiVisualizerCoordinates.getIndexSectionPlaying(midiCurrentTime)

        const indexToDraw: { [key: number]: number } = midiVisualizerCoordinates.getIndexToDraw(
            midiCurrentTime,
            audioPlayerState
        )

        const coordinates = [
            midiVisualizerCoordinates.getSectionCoordinates(notesCoordinates, indexToDraw[0]),
            midiVisualizerCoordinates.getSectionCoordinates(notesCoordinates, indexToDraw[1]),
        ]

        useEffect(() => {
            const newActiveNotes = midiVisualizerCoordinates.getActiveNotes(
                notesCoordinates,
                indexSectionPlaying,
                midiCurrentTime
            )

            if (midiMode === 'wait') {
                const timeToNextNote = midiVisualizerCoordinates.getTimeToNextNote(
                    notesCoordinates,
                    indexSectionPlaying,
                    midiCurrentTime
                )
                onChangeTimeToNextNote(timeToNextNote)
            }

            onChangeActiveNotes((activeNotes: ActiveNote[]) => {
                return isEqual(newActiveNotes, activeNotes) ? activeNotes : newActiveNotes
            })
        }, [midiCurrentTime, notesCoordinates, midiMode])

        useEffect(() => {
            function animationStep(midiCurrentTime: number) {
                const top = midiVisualizerCoordinates.getPercentageTopSection(midiCurrentTime)
                const svgs = ref.current?.getElementsByTagName('svg')

                if (svgs) {
                    svgs[0].style.transform = `scaleY(-1) translateY(${top[0]})`
                    svgs[1].style.transform = `scaleY(-1) translateY(${top[1]})`
                }

                animation.current = window.requestAnimationFrame(() =>
                    animationStep(midiCurrentTime)
                )
            }

            animation.current = window.requestAnimationFrame(() => animationStep(midiCurrentTime))

            if (audioPlayerState === 'stopped' || audioPlayerState === 'paused') {
                cancelAnimationFrame(animation.current)
            }

            return function cleanup() {
                cancelAnimationFrame(animation.current)
            }
        }, [midiCurrentTime, audioPlayerState, midiVisualizerCoordinates])

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
            </div>
        )
    }
)
