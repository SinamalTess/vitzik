import { Visualizer } from '../Visualizer'
import React from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayerState, MidiMetas, ActiveNote, MidiMode, Instrument } from '../../types'
import { ErrorBoundary } from '../_presentational/ErrorBoundary'

interface PreviewProps {
    activeInstruments: Instrument[]
    midiMode: MidiMode
    midiFile: IMidiFile | null
    midiMetas: MidiMetas | null
    activeTracks: number[]
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
}

export function Preview({
    activeInstruments,
    midiMode,
    midiFile,
    midiMetas,
    activeTracks,
    audioPlayerState,
    onChangeActiveNotes,
    onChangeTimeToNextNote,
    onChangeActiveInstruments,
}: PreviewProps) {
    return (
        <ErrorBoundary>
            {midiMetas && midiFile ? (
                <Visualizer
                    activeInstruments={activeInstruments}
                    midiFile={midiFile}
                    midiMode={midiMode}
                    midiMetas={midiMetas}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                    onChangeInstruments={onChangeActiveInstruments}
                />
            ) : null}
        </ErrorBoundary>
    )
}
