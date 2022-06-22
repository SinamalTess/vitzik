import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector } from './MidiInputSelector'
import './Settings.scss'
import { Instrument, MusicSystem, ActiveNote } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { InstrumentSelector } from './InstrumentSelector'
import { MidiTrackSelector } from './MidiTrackSelector'

interface SettingsProps {
    appMode: AppMode
    musicSystem: MusicSystem
    playableTracksIndexes: number[]
    activeTracks: number[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: (instrument: Instrument) => void
    onChangeActiveNotes: (activeNotes: (currentActiveNotes: ActiveNote[]) => ActiveNote[]) => void
    onChangeActiveTracks: (activeTracks: number[]) => void
}

export function Settings({
    appMode,
    musicSystem,
    playableTracksIndexes,
    activeTracks,
    onChangeMusicSystem,
    onChangeAppMode,
    onChangeInstrument,
    onChangeActiveNotes,
    onChangeActiveTracks,
}: SettingsProps) {
    return (
        <div className="settings">
            <MusicSystemSelector onChange={onChangeMusicSystem} musicSystem={musicSystem} />
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <InstrumentSelector onChange={onChangeInstrument} />
            <MidiInputSelector onChangeActiveNotes={onChangeActiveNotes} />
            {playableTracksIndexes.length > 1 ? (
                <MidiTrackSelector
                    activeTracks={activeTracks}
                    playableTracksIndexes={playableTracksIndexes}
                    onChangeActiveTracks={onChangeActiveTracks}
                />
            ) : null}
        </div>
    )
}
