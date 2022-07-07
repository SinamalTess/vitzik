import React, { useEffect, useMemo } from 'react'
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
        const indexToDraw = midiVisualizerCoordinates.getIndexToDraw(
            midiCurrentTime,
            audioPlayerState
        )

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

        return (
            <div className="visualizer">
                {midiVisualizerCoordinates.getSectionNames().map((name, index) => {
                    const section =
                        notesCoordinates?.find((section) =>
                            section.hasOwnProperty(indexToDraw[name])
                        ) ?? []
                    const coordinates =
                        section && Object.values(section)[0] ? [...Object.values(section)[0]] : []
                    return (
                        <VisualizerSection
                            index={index}
                            key={name}
                            indexToDraw={indexToDraw[name]}
                            notesCoordinates={coordinates}
                            top={midiVisualizerCoordinates.getPercentageTopSection(
                                name,
                                midiCurrentTime
                            )}
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
