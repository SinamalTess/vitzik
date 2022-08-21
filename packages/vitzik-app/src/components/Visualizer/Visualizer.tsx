import { MidiVisualizer } from '../MidiVisualizer'
import React from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    MidiMetas,
    ActiveNote,
    MidiPlayMode,
    Instrument,
    LoopTimestamps,
    AudioPlayerState,
} from '../../types'
import { ErrorBoundary } from 'vitzik-ui'

interface VisualizerProps {
    activeInstruments: Instrument[]
    midiPlayMode: MidiPlayMode
    nextNoteStartingTime: number | null
    loopTimestamps: LoopTimestamps
    isEditingLoop: boolean
    midiFile: IMidiFile | null
    midiMetas: MidiMetas | null
    activeTracks: number[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

export const Visualizer = React.memo(function Preview({
    loopTimestamps,
    activeInstruments,
    midiPlayMode,
    nextNoteStartingTime,
    isEditingLoop,
    midiFile,
    midiMetas,
    activeTracks,
    onChangeActiveNotes,
    onChangeNextNoteStartingTime,
    onChangeActiveInstruments,
    onChangeLoopTimestamps,
    onChangeAudioPlayerState,
}: VisualizerProps) {
    return (
        <ErrorBoundary>
            {midiMetas && midiFile ? (
                <MidiVisualizer
                    loopTimestamps={loopTimestamps}
                    activeInstruments={activeInstruments}
                    midiFile={midiFile}
                    midiPlayMode={midiPlayMode}
                    midiMetas={midiMetas}
                    nextNoteStartingTime={nextNoteStartingTime}
                    isEditingLoop={isEditingLoop}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeNextNoteStartingTime={onChangeNextNoteStartingTime}
                    onChangeInstruments={onChangeActiveInstruments}
                    onChangeLoopTimes={onChangeLoopTimestamps}
                    onChangeAudioPlayerState={onChangeAudioPlayerState}
                />
            ) : null}
        </ErrorBoundary>
    )
})
