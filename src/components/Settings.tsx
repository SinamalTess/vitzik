import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector } from './MidiInputSelector'
import './Settings.scss'
import { Instrument, MusicSystem } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { InstrumentSelector } from './InstrumentSelector'
import { ActiveNote } from '../App'
import { MidiTrackSelector } from './MidiTrackSelector'

interface SettingsProps {
    appMode: AppMode
    musicSystem: MusicSystem
    playableTracksIndexes: number[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: (instrument: Instrument) => void
    onChangeActiveNotes: (activeNotes: (currentActiveNotes: ActiveNote[]) => ActiveNote[]) => void
}

export function Settings({
    appMode,
    musicSystem,
    playableTracksIndexes,
    onChangeMusicSystem,
    onChangeAppMode,
    onChangeInstrument,
    onChangeActiveNotes,
}: SettingsProps) {
    return (
        <div className="settings">
            <MusicSystemSelector onChange={onChangeMusicSystem} musicSystem={musicSystem} />
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <InstrumentSelector onChange={onChangeInstrument} />
            <MidiInputSelector onChangeActiveNotes={onChangeActiveNotes} />
            {playableTracksIndexes.length > 1 ? (
                <MidiTrackSelector playableTracksIndexes={playableTracksIndexes} />
            ) : null}
        </div>
    )
}
