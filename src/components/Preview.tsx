import { Staff } from './Staff'
import { MidiTrackTitle } from './MidiTrackTitle'
import { MidiImporter, OnMidiImport } from './MidiImporter'
import { MidiTrackInfos, Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { AlphabeticalNote, MidiJsonNote } from '../types'

interface PreviewProps {
    appMode: AppMode
    notes: AlphabeticalNote[]
    trackPosition: number
    midiTrackNotes: MidiJsonNote[]
    midiTrackTitle: string
    midiTrackInfos: MidiTrackInfos | null
    onMidiImport: OnMidiImport
    setActiveNotes: (notes: AlphabeticalNote[]) => void
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
}: PreviewProps) {
    return appMode === 'learning' ? (
        <Staff notes={notes} />
    ) : (
        <>
            <MidiTrackTitle midiTrackTitle={midiTrackTitle} />
            <MidiImporter onMidiImport={onMidiImport} />
            <Visualizer
                notes={midiTrackNotes}
                trackPosition={trackPosition}
                midiTrackInfos={midiTrackInfos}
                setActiveNotes={setActiveNotes}
            />
        </>
    )
}
