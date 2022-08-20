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
    timeToNextNote: number | null
    loopTimestamps: LoopTimestamps
    isEditingLoop: boolean
    midiFile: IMidiFile | null
    midiMetas: MidiMetas | null
    activeTracks: number[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

export const Visualizer = React.memo(function Preview({
    loopTimestamps,
    activeInstruments,
    midiPlayMode,
    timeToNextNote,
    isEditingLoop,
    midiFile,
    midiMetas,
    activeTracks,
    onChangeActiveNotes,
    onChangeTimeToNextNote,
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
                    midiMode={midiPlayMode}
                    midiMetas={midiMetas}
                    timeToNextNote={timeToNextNote}
                    isEditingLoop={isEditingLoop}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                    onChangeInstruments={onChangeActiveInstruments}
                    onChangeLoopTimes={onChangeLoopTimestamps}
                    onChangeAudioPlayerState={onChangeAudioPlayerState}
                />
            ) : null}
        </ErrorBoundary>
    )
})
