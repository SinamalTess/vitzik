import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector, onChangeMidiInput } from './MidiInputSelector'
import './Settings.scss'
import { MusicSystem } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { AudioPlayer } from './AudioPlayer'

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
    return (
        <div className="settings">
            <AudioPlayer
                isSoundOn={isSoundOn}
                toggleSound={toggleSound}
                setTrackPosition={setTrackPosition}
                trackPosition={trackPosition}
                midiTrackDuration={midiTrackDuration}
                onPlay={onPlay}
            />
            <MusicSystemSelector
                onChangeMusicSystem={onChangeMusicSystem}
                musicSystem={musicSystem}
            />
            <ModeSelector onChangeAppMode={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector midiInputs={midiInputs} onChangeMidiInput={onChangeMidiInput} />
        </div>
    )
}
