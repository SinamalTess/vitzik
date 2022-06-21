import { Staff } from './Staff'
import { MidiImporter } from './MidiImporter'
import { Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { ActiveNote } from '../App'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayerState, MidiInfos } from '../types'
import { ErrorBoundary } from './generics/ErrorBoundary'

interface PreviewProps {
    appMode: AppMode
    notes: ActiveNote[]
    midiFile: IMidiFile | null
    midiInfos: MidiInfos | null
    midiTrackCurrentTime: number
    activeNotes: ActiveNote[]
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: (notes: ActiveNote[]) => void
    onMidiImport: (title: string, midiJSON: IMidiFile) => void
}

export function Preview({
    appMode,
    notes,
    midiFile,
    midiInfos,
    midiTrackCurrentTime,
    activeNotes,
    audioPlayerState,
    onMidiImport,
    onChangeActiveNotes,
}: PreviewProps) {
    const staffNotes = notes.map((note) => note.name)
    return appMode === 'learning' ? (
        <Staff notes={staffNotes} />
    ) : (
        <ErrorBoundary>
            <MidiImporter onMidiImport={onMidiImport} />
            <Visualizer
                midiFile={midiFile}
                midiTrackCurrentTime={midiTrackCurrentTime}
                midiInfos={midiInfos}
                onChangeActiveNotes={onChangeActiveNotes}
                activeNotes={activeNotes}
                audioPlayerState={audioPlayerState}
            />
        </ErrorBoundary>
    )
}
