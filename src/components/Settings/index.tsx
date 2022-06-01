import { SoundController } from '../SoundController'
import React from 'react'
import { MusicSystemSelector } from '../MusicSystemSelector'
import { MidiImporter } from '../MidiImporter'
import { MidiInputSelector } from '../MidiInputSelector'
import './settings.scss'
import { MidiJsonNote, MusicSystem } from '../../types'

interface SettingsProps {
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    midiInputs: MIDIInput[]
    onChangeInput: (event: React.ChangeEvent<HTMLSelectElement>) => void
    onMidiImport: (
        midiTrackTitle: string,
        midiTrackNotes: MidiJsonNote[]
    ) => void
}

export function Settings({
    isSoundOn,
    toggleSound,
    onChangeMusicSystem,
    midiInputs,
    onChangeInput,
    onMidiImport,
}: SettingsProps) {
    return (
        <div className="settings">
            <SoundController isSoundOn={isSoundOn} toggleSound={toggleSound} />
            <MusicSystemSelector onChangeMusicSystem={onChangeMusicSystem} />
            <MidiImporter onMidiImport={onMidiImport} />
            <MidiInputSelector
                inputs={midiInputs}
                onChangeInput={onChangeInput}
            />
        </div>
    )
}
