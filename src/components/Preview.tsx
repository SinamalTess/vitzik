import { Staff } from './Staff'
import { MidiTrackTitle } from './MidiTrackTitle'
import { MidiImporter, OnMidiImport } from './MidiImporter'
import { MidiTrackInfos, Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { MidiJsonNote } from '../types'
import { ActiveNote, AudioPlayerState } from '../App'

interface PreviewProps {
    appMode: AppMode
    notes: ActiveNote[]
    midiTrackCurrentTime: number
    midiTrackNotes: MidiJsonNote[]
    midiTrackTitle: string
    midiTrackInfos: MidiTrackInfos | null
    onMidiImport: OnMidiImport
    setActiveNotes: (notes: ActiveNote[]) => void
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
    setActiveNotes,
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
                setActiveNotes={setActiveNotes}
                activeNotes={activeNotes}
                audioPlayerState={audioPlayerState}
            />
        </>
    )
}
