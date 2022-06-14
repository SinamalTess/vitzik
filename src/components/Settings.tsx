import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector } from './MidiInputSelector'
import './Settings.scss'
import { Instrument, MusicSystem } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { InstrumentSelector } from './InstrumentSelector'
import { ActiveNote } from '../App'

interface SettingsProps {
    appMode: AppMode
    musicSystem: MusicSystem
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: (instrument: Instrument) => void
    onChangeActiveNotes: (activeNotes: (currentActiveNotes: ActiveNote[]) => ActiveNote[]) => void
}

export function Settings({
    appMode,
    musicSystem,
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
        </div>
    )
}
