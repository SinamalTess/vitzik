import React, { useEffect, useMemo } from 'react'
import './Visualizer.scss'
import { ActiveNote, AudioPlayerState, MidiInfos } from '../types'
import isEqual from 'lodash.isequal'
import { IMidiFile } from 'midi-json-parser-worker'
import { VisualizerSection } from './VisualizerSection'
import { VisualizerTracks } from './VisualizerTracks'
import { WithContainerDimensions } from './hocs/WithContainerDimensions'
import { MidiVisualizerCoordinates } from '../utils/MidiVisualizerCoordinates'

interface VisualizerProps {
    activeNotes: ActiveNote[]
    midiCurrentTime: number
    midiFile: IMidiFile
    heightPerBeat?: number
    midiInfos: MidiInfos
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
        midiInfos,
        audioPlayerState,
        activeTracks,
        height = 0,
        width = 0,
        onChangeActiveNotes,
        onChangeTimeToNextNote,
    }: VisualizerProps) => {
        const midiVisualizerCoordinates = new MidiVisualizerCoordinates(heightPerBeat, midiInfos, {
            w: width,
            h: height,
        })

        const indexSectionPlaying = useMemo(
            () => midiVisualizerCoordinates.getIndexSectionPlaying(midiCurrentTime),
            [midiCurrentTime]
        )

        const allNotesCoordinates = useMemo(
            () => midiVisualizerCoordinates.getNotesCoordinates(midiFile),
            [heightPerBeat, midiInfos, width, height]
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
                {midiVisualizerCoordinates.getSectionNames().map((name, index) => (
                    <VisualizerSection
                        index={index}
                        key={name}
                        indexToDraw={indexToDraw[name]}
                        notesCoordinates={notesCoordinates[indexToDraw[name]]}
                        top={midiVisualizerCoordinates.getPercentageTopSection(
                            name,
                            midiCurrentTime
                        )}
                        height={height}
                        width={width}
                    />
                ))}
                <VisualizerTracks height={height} width={width} />
            </div>
        )
    }
)
