import { Staff } from './Staff'
import { MidiTrackTitle } from './MidiTrackTitle'
import { MidiImporter } from './MidiImporter'
import { MidiTrackInfos, Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { ActiveNote } from '../App'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayerState } from '../types'

interface PreviewProps {
    appMode: AppMode
    notes: ActiveNote[]
    midiTrack: IMidiFile | null
    midiTrackInfos: MidiTrackInfos | null
    midiTrackTitle: string
    midiTrackCurrentTime: number
    activeNotes: ActiveNote[]
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: (notes: ActiveNote[]) => void
    onMidiImport: (title: string, midiJSON: IMidiFile) => void
}

export function Preview({
    appMode,
    notes,
    midiTrack,
    midiTrackInfos,
    midiTrackTitle,
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
        <>
            <MidiTrackTitle midiTrackTitle={midiTrackTitle} />
            <MidiImporter onMidiImport={onMidiImport} />
            <Visualizer
                midiTrack={midiTrack}
                midiTrackCurrentTime={midiTrackCurrentTime}
                midiTrackInfos={midiTrackInfos}
                onChangeActiveNotes={onChangeActiveNotes}
                activeNotes={activeNotes}
                audioPlayerState={audioPlayerState}
            />
        </>
    )
}
