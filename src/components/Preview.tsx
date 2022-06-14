import { Staff } from './Staff'
import { MidiTrackTitle } from './MidiTrackTitle'
import { MidiImporter, OnMidiImport } from './MidiImporter'
import { MidiTrackInfos, Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { MidiJsonNote } from '../types'
import { ActiveNote } from '../App'
import { AudioPlayerState } from './AudioPlayer'

interface PreviewProps {
    appMode: AppMode
    notes: ActiveNote[]
    midiTrackCurrentTime: number
    midiTrackNotes: MidiJsonNote[]
    midiTrackTitle: string
    midiTrackInfos: MidiTrackInfos | null
    onMidiImport: OnMidiImport
    onChangeActiveNotes: (notes: ActiveNote[]) => void
    activeNotes: ActiveNote[]
    audioPlayerState: AudioPlayerState
}

export function Preview({
    appMode,
    notes,
    midiTrackNotes,
    midiTrackTitle,
    midiTrackCurrentTime,
    midiTrackInfos,
    onMidiImport,
    onChangeActiveNotes,
    activeNotes,
    audioPlayerState,
}: PreviewProps) {
    const staffNotes = notes.map((note) => note.name)
    return appMode === 'learning' ? (
        <Staff notes={staffNotes} />
    ) : (
        <>
            <MidiTrackTitle midiTrackTitle={midiTrackTitle} />
            <MidiImporter onMidiImport={onMidiImport} />
            <Visualizer
                notes={midiTrackNotes}
                midiTrackCurrentTime={midiTrackCurrentTime}
                midiTrackInfos={midiTrackInfos}
                onChangeActiveNotes={onChangeActiveNotes}
                activeNotes={activeNotes}
                audioPlayerState={audioPlayerState}
            />
        </>
    )
}
