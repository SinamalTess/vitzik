import { MidiVisualizer } from '../MidiVisualizer'
import React from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayerState, MidiMetas, ActiveNote, MidiMode, Instrument } from '../../types'
import { ErrorBoundary } from '../_presentational/ErrorBoundary'
import { LoopTimes } from '../../types/LoopTimes'

interface VisualizerProps {
    worker: Worker
    activeInstruments: Instrument[]
    midiMode: MidiMode
    loopTimes: LoopTimes
    isEditingLoop: boolean
    midiFile: IMidiFile | null
    midiMetas: MidiMetas | null
    activeTracks: number[]
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimes>>
}

export const Visualizer = React.memo(function Preview({
    worker,
    loopTimes,
    activeInstruments,
    midiMode,
    isEditingLoop,
    midiFile,
    midiMetas,
    activeTracks,
    audioPlayerState,
    onChangeActiveNotes,
    onChangeTimeToNextNote,
    onChangeActiveInstruments,
    onChangeLoopTimes,
}: VisualizerProps) {
    return (
        <ErrorBoundary>
            {midiMetas && midiFile ? (
                <MidiVisualizer
                    worker={worker}
                    loopTimes={loopTimes}
                    activeInstruments={activeInstruments}
                    midiFile={midiFile}
                    midiMode={midiMode}
                    midiMetas={midiMetas}
                    isEditingLoop={isEditingLoop}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                    onChangeInstruments={onChangeActiveInstruments}
                    onChangeLoopTimes={onChangeLoopTimes}
                />
            ) : null}
        </ErrorBoundary>
    )
})
