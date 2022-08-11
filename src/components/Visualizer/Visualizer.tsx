import { MidiVisualizer } from '../MidiVisualizer'
import React from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import { MidiMetas, ActiveNote, MidiMode, Instrument, LoopTimestamps } from '../../types'
import { ErrorBoundary } from '../_presentational/ErrorBoundary'

interface VisualizerProps {
    intervalWorker: Worker
    activeInstruments: Instrument[]
    midiMode: MidiMode
    loopTimestamps: LoopTimestamps
    isEditingLoop: boolean
    midiFile: IMidiFile | null
    midiMetas: MidiMetas | null
    activeTracks: number[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
}

export const Visualizer = React.memo(function Preview({
    intervalWorker,
    loopTimestamps,
    activeInstruments,
    midiMode,
    isEditingLoop,
    midiFile,
    midiMetas,
    activeTracks,
    onChangeActiveNotes,
    onChangeTimeToNextNote,
    onChangeActiveInstruments,
    onChangeLoopTimestamps,
}: VisualizerProps) {
    return (
        <ErrorBoundary>
            {midiMetas && midiFile ? (
                <MidiVisualizer
                    intervalWorker={intervalWorker}
                    loopTimestamps={loopTimestamps}
                    activeInstruments={activeInstruments}
                    midiFile={midiFile}
                    midiMode={midiMode}
                    midiMetas={midiMetas}
                    isEditingLoop={isEditingLoop}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                    onChangeInstruments={onChangeActiveInstruments}
                    onChangeLoopTimes={onChangeLoopTimestamps}
                />
            ) : null}
        </ErrorBoundary>
    )
})
