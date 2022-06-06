import { Staff } from './Staff'
import { TrackInfos } from './TrackInfos'
import { MidiImporter, OnMidiImport } from './MidiImporter'
import { MidiInfos, Visualizer } from './Visualizer'
import React from 'react'
import { AppMode } from './ModeSelector'
import { AlphabeticalNote, MidiJsonNote } from '../types'

interface PreviewProps {
    appMode: AppMode
    notes: AlphabeticalNote[]
    midiTrackNotes: MidiJsonNote[]
    midiTrackTitle: string
    onMidiImport: OnMidiImport
    trackPosition: number
    midiInfos: MidiInfos | null
}

export function Preview({
    appMode,
    notes,
    midiTrackNotes,
    onMidiImport,
    midiTrackTitle,
    trackPosition,
    midiInfos,
}: PreviewProps) {
    const isMidiImported = Boolean(midiTrackNotes.length)

    return appMode === 'learning' ? (
        <Staff notes={notes} />
    ) : (
        <>
            <TrackInfos title={midiTrackTitle} />
            {isMidiImported ? null : <MidiImporter onMidiImport={onMidiImport} />}
            <Visualizer
                notes={midiTrackNotes}
                trackPosition={trackPosition}
                midiInfos={midiInfos}
            />
        </>
    )
}
