import { Staff } from '../Staff'
import { Visualizer } from '../Visualizer'
import React from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    AudioPlayerState,
    MidiMetas,
    AlphabeticalNote,
    AppMode,
    ActiveNote,
    MidiMode,
} from '../../types'
import { ErrorBoundary } from '../_presentational/ErrorBoundary'

interface PreviewProps {
    appMode: AppMode
    midiMode: MidiMode
    midiFile: IMidiFile | null
    midiMetas: MidiMetas | null
    activeNotes: ActiveNote[]
    activeTracks: number[]
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
}

export function Preview({
    appMode,
    midiMode,
    midiFile,
    midiMetas,
    activeNotes,
    activeTracks,
    audioPlayerState,
    onChangeActiveNotes,
    onChangeTimeToNextNote,
}: PreviewProps) {
    const staffNotes = activeNotes
        .filter((note) => !note.name)
        .map((note) => note.name) as AlphabeticalNote[]
    return appMode === 'learning' ? (
        <Staff notes={staffNotes} />
    ) : (
        <ErrorBoundary>
            {midiMetas && midiFile ? (
                <Visualizer
                    midiFile={midiFile}
                    midiMode={midiMode}
                    midiMetas={midiMetas}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                />
            ) : null}
        </ErrorBoundary>
    )
}
