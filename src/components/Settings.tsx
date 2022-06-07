import { SoundController } from './SoundController'
import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector, onChangeMidiInput } from './MidiInputSelector'
import './Settings.scss'
import { MusicSystem } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { RangeSlider } from './generics/RangeSlider'
import { PlayerController } from './PlayerController'

interface SettingsProps {
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
    midiInputs: MIDIInput[]
    appMode: AppMode
    musicSystem: MusicSystem
    setTrackPosition: (position: number) => void
    trackPosition: number
    midiTrackDuration: number
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeMidiInput: onChangeMidiInput
    onChangeAppMode: (mode: AppMode) => void
    onPlay: () => void
}

export function Settings({
    isSoundOn,
    toggleSound,
    midiInputs,
    appMode,
    musicSystem,
    setTrackPosition,
    trackPosition,
    midiTrackDuration,
    onChangeMusicSystem,
    onChangeMidiInput,
    onChangeAppMode,
    onPlay,
}: SettingsProps) {
    const trackPositionInDate = new Date(trackPosition)
    return (
        <div className="settings">
            <>
                <RangeSlider
                    setValue={setTrackPosition}
                    value={trackPosition}
                    max={midiTrackDuration}
                />
                {`${trackPositionInDate.getMinutes()}:${trackPositionInDate.getSeconds()}`}
            </>
            <SoundController isSoundOn={isSoundOn} toggleSound={toggleSound} />
            <PlayerController onPlay={onPlay} />
            <MusicSystemSelector
                onChangeMusicSystem={onChangeMusicSystem}
                musicSystem={musicSystem}
            />
            <ModeSelector onChangeAppMode={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector midiInputs={midiInputs} onChangeMidiInput={onChangeMidiInput} />
        </div>
    )
}
