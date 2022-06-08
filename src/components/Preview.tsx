import { Staff } from './Staff'
import { MidiTrackTitle } from './MidiTrackTitle'
import { MidiImporter, OnMidiImport } from './MidiImporter'
import { MidiTrackInfos, Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { MidiJsonNote } from '../types'
import { ActiveNote } from '../App'

interface PreviewProps {
    appMode: AppMode
    notes: ActiveNote[]
    trackPosition: number
    midiTrackNotes: MidiJsonNote[]
    midiTrackTitle: string
    midiTrackInfos: MidiTrackInfos | null
    onMidiImport: OnMidiImport
    setActiveNotes: (notes: ActiveNote[]) => void
    activeNotes: ActiveNote[]
}

export function Preview({
    appMode,
    notes,
    midiTrackNotes,
    midiTrackTitle,
    trackPosition,
    midiTrackInfos,
    onMidiImport,
    setActiveNotes,
    activeNotes,
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
                trackPosition={trackPosition}
                midiTrackInfos={midiTrackInfos}
                setActiveNotes={setActiveNotes}
                activeNotes={activeNotes}
            />
        </>
    )
}
