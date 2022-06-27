import { Staff } from '../Staff'
import { MidiImporter } from '../MidiImporter'
import { Visualizer } from '../Visualizer'
import React from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayerState, MidiInfos, AlphabeticalNote, AppMode, ActiveNote } from '../../types'
import { ErrorBoundary } from '../generics/ErrorBoundary'

interface PreviewProps {
    appMode: AppMode
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
    const staffNotes = activeNotes
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
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={onChangeActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                />
            ) : null}
        </ErrorBoundary>
    )
}
