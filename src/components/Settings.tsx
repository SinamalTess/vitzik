import { SoundController } from './SoundController'
import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector, onChangeMidiInput } from './MidiInputSelector'
import './Settings.scss'
import { MusicSystem } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { RangeSlider } from './generics/RangeSlider'

interface SettingsProps {
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
    midiInputs: MIDIInput[]
    appMode: AppMode
    musicSystem: MusicSystem
    setTrackPosition: (position: number) => void
    trackPosition: number
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeMidiInput: onChangeMidiInput
    onChangeAppMode: (mode: AppMode) => void
}

export function Settings({
    isSoundOn,
    toggleSound,
    midiInputs,
    appMode,
    musicSystem,
    setTrackPosition,
    trackPosition,
    onChangeMusicSystem,
    onChangeMidiInput,
    onChangeAppMode,
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
            <MidiInputSelector midiInputs={midiInputs} onChangeMidiInput={onChangeMidiInput} />
        </div>
    )
}
