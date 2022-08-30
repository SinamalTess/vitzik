import { MidiVisualizer } from '../MidiVisualizer'
import React from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    MidiMetas,
    ActiveNote,
    MidiPlayMode,
    LoopTimestamps,
    AudioPlayerState,
    ActiveInstrument,
} from '../../types'
import { ErrorBoundary } from 'vitzik-ui'

interface VisualizerProps {
    activeInstruments: ActiveInstrument[]
    midiPlayMode: MidiPlayMode
    nextNoteStartingTime: number | null
    loopTimestamps: LoopTimestamps
    isEditingLoop: boolean
    showDampPedal: boolean
    midiSpeedFactor: number
    midiFile: IMidiFile | null
    midiMetas: MidiMetas | null
    activeTracks: number[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

export const Visualizer = React.memo(function Preview({
    loopTimestamps,
    activeInstruments,
    midiPlayMode,
    midiSpeedFactor,
    nextNoteStartingTime,
    isEditingLoop,
    showDampPedal,
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
                    midiSpeedFactor={midiSpeedFactor}
                    loopTimestamps={loopTimestamps}
                    activeInstruments={activeInstruments}
                    midiFile={midiFile}
                    midiPlayMode={midiPlayMode}
                    midiMetas={midiMetas}
                    showDampPedal={showDampPedal}
                    nextNoteStartingTime={nextNoteStartingTime}
                    isEditingLoop={isEditingLoop}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeNextNoteStartingTime={onChangeNextNoteStartingTime}
                    onChangeActiveInstruments={onChangeActiveInstruments}
                    onChangeLoopTimes={onChangeLoopTimestamps}
                    onChangeAudioPlayerState={onChangeAudioPlayerState}
                />
            ) : null}
        </ErrorBoundary>
    )
})
