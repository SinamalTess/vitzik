import { SoundController } from './SoundController'
import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector } from './MidiInputSelector'
import './Settings.scss'
import { MusicSystem } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { RangeSlider } from './generics/RangeSlider'

interface SettingsProps {
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    midiInputs: MIDIInput[]
    onChangeInput: (event: React.ChangeEvent<HTMLSelectElement>) => void
    onChangeAppMode: (mode: AppMode) => void
    appMode: AppMode
    musicSystem: MusicSystem
    setTrackPosition: (position: number) => void
    trackPosition: number
}

export function Settings({
    isSoundOn,
    toggleSound,
    onChangeMusicSystem,
    midiInputs,
    onChangeInput,
    onChangeAppMode,
    appMode,
    musicSystem,
    setTrackPosition,
    trackPosition,
}: SettingsProps) {
    return (
        <div className="settings">
            <RangeSlider setValue={setTrackPosition} value={trackPosition} />
            <SoundController isSoundOn={isSoundOn} toggleSound={toggleSound} />
            <MusicSystemSelector
                onChangeMusicSystem={onChangeMusicSystem}
                musicSystem={musicSystem}
            />
            <ModeSelector onChangeAppMode={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector inputs={midiInputs} onChangeInput={onChangeInput} />
        </div>
    )
}
