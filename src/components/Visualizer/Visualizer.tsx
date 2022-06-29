import React, { useEffect, useMemo } from 'react'
import './Visualizer.scss'
import { AudioPlayerState, MidiMetas, ActiveNote } from '../../types'
import isEqual from 'lodash.isequal'
import { IMidiFile } from 'midi-json-parser-worker'
import { VisualizerSection } from './VisualizerSection'
import { VisualizerTracks } from './VisualizerTracks'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { MidiVisualizerCoordinates } from './MidiVisualizerCoordinates'

interface VisualizerProps {
    midiCurrentTime: number
    midiFile: IMidiFile
    heightPerBeat?: number
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
        midiFile,
        heightPerBeat = 100,
        midiMetas,
        audioPlayerState,
        activeTracks,
        height = 0,
        width = 0,
        onChangeActiveNotes,
        onChangeTimeToNextNote,
    }: VisualizerProps) => {
        const midiVisualizerCoordinates = new MidiVisualizerCoordinates(heightPerBeat, midiMetas, {
            w: width,
            h: height,
        })

        const indexSectionPlaying = useMemo(
            () => midiVisualizerCoordinates.getIndexSectionPlaying(midiCurrentTime),
            [midiCurrentTime]
        )

        const allNotesCoordinates = useMemo(
            () => midiVisualizerCoordinates.getNotesCoordinates(midiFile),
            [heightPerBeat, midiMetas, width, height]
        )

        const notesCoordinates = useMemo(
            () =>
                MidiVisualizerCoordinates.mergeNotesCoordinates(activeTracks, allNotesCoordinates),
            [allNotesCoordinates, activeTracks]
        )

        const indexToDraw = useMemo(
            () => midiVisualizerCoordinates.getIndexToDraw(midiCurrentTime, audioPlayerState),
            [indexSectionPlaying, audioPlayerState]
        )

        useEffect(() => {
            const newActiveNotes = midiVisualizerCoordinates.getActiveNotes(
                notesCoordinates,
                indexSectionPlaying,
                midiCurrentTime
            )

            const timeToNextNote = midiVisualizerCoordinates.getTimeToNextNote(
                notesCoordinates,
                indexSectionPlaying,
                midiCurrentTime
            )

            onChangeActiveNotes((activeNotes: ActiveNote[]) => {
                if (!isEqual(newActiveNotes, activeNotes)) {
                    onChangeTimeToNextNote(timeToNextNote)
                    return newActiveNotes
                } else {
                    return activeNotes
                }
            })
        }, [midiCurrentTime, notesCoordinates])

        return (
            <div className="visualizer">
                {midiVisualizerCoordinates.getSectionNames().map((name, index) => {
                    const section =
                        notesCoordinates?.find((section) => indexToDraw[name] in section) ?? []
                    return (
                        <VisualizerSection
                            index={index}
                            key={name}
                            indexToDraw={indexToDraw[name]}
                            notesCoordinates={section ? Object.values(section)[0] : []}
                            top={midiVisualizerCoordinates.getPercentageTopSection(
                                name,
                                midiCurrentTime
                            )}
                            height={height}
                            width={width}
                        />
                    )
                })}
                <VisualizerTracks height={height} width={width} />
            </div>
        )
    }
)
