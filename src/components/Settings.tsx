import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import { MidiInputSelector, onChangeMidiInput } from './MidiInputSelector'
import './Settings.scss'
import { Instrument, MusicSystem } from '../types'
import { AppMode, ModeSelector } from './ModeSelector'
import { AudioPlayer, AudioPlayerState } from './AudioPlayer'
import { InstrumentSelector } from './InstrumentSelector'

interface SettingsProps {
    isMute: boolean
    isMidiImported: boolean
    toggleSound: (isSoundOn: boolean) => void
    midiInputs: MIDIInput[]
    appMode: AppMode
    musicSystem: MusicSystem
    midiTrackCurrentTime: number
    midiTrackDuration: number
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeMidiInput: onChangeMidiInput
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: (instrument: Instrument) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeMidiTrackCurrentTime: (midiTrackCurrentTime: number) => void
}

export function Settings({
    isMute,
    isMidiImported,
    toggleSound,
    midiInputs,
    appMode,
    musicSystem,
    midiTrackCurrentTime,
    midiTrackDuration,
    onChangeMusicSystem,
    onChangeMidiInput,
    onChangeAppMode,
    onChangeInstrument,
    onChangeAudioPlayerState,
    onChangeMidiTrackCurrentTime,
}: SettingsProps) {
    return (
        <div className="settings">
            {isMidiImported ? (
                <AudioPlayer
                    isMute={isMute}
                    toggleSound={toggleSound}
                    midiTrackCurrentTime={midiTrackCurrentTime}
                    midiTrackDuration={midiTrackDuration}
                    onChangeAudioPlayerState={onChangeAudioPlayerState}
                    onChangeMidiTrackCurrentTime={onChangeMidiTrackCurrentTime}
                />
            ) : null}
            <MusicSystemSelector onChange={onChangeMusicSystem} musicSystem={musicSystem} />
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector midiInputs={midiInputs} onChange={onChangeMidiInput} />
            <InstrumentSelector onChange={onChangeInstrument} />
        </div>
    )
}
