import { Staff } from './Staff'
import { MidiImporter } from './MidiImporter'
import { Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayerState, MidiInfos, ActiveNote, AlphabeticalNote } from '../types'
import { ErrorBoundary } from './generics/ErrorBoundary'

interface PreviewProps {
    appMode: AppMode
    notes: ActiveNote[]
    midiFile: IMidiFile | null
    midiInfos: MidiInfos | null
    midiCurrentTime: number
    activeNotes: ActiveNote[]
    activeTracks: number[]
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onMidiImport: (title: string, midiJSON: IMidiFile) => void
}

export function Preview({
    appMode,
    notes,
    midiFile,
    midiInfos,
    midiCurrentTime,
    activeNotes,
    activeTracks,
    audioPlayerState,
    onMidiImport,
    onChangeActiveNotes,
    onChangeTimeToNextNote,
}: PreviewProps) {
    const staffNotes = notes
        .filter((note) => !note.name)
        .map((note) => note.name) as AlphabeticalNote[]
    return appMode === 'learning' ? (
        <Staff notes={staffNotes} />
    ) : (
        <ErrorBoundary>
            <MidiImporter onMidiImport={onMidiImport} />
            {midiInfos && midiFile ? (
                <Visualizer
                    midiFile={midiFile}
                    midiCurrentTime={midiCurrentTime}
                    midiInfos={midiInfos}
                    activeNotes={activeNotes}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                />
            ) : null}
        </ErrorBoundary>
    )
}
