import React from 'react'
import { MusicSystemSelector } from '../MusicSystemSelector'
import './Settings.scss'
import {
    Instrument,
    MusicSystem,
    MidiVisualizerActiveNote,
    MidiMode,
    AppMode,
    ActiveNote,
} from '../../types'
import { ModeSelector } from '../ModeSelector'
import { InstrumentSelector } from '../InstrumentSelector'
import { MidiTrackSelector } from '../MidiTrackSelector'
import { MidiInputSelector } from '../MidiInputSelector'
import { Button } from '../generics/Button'

interface SettingsProps {
    appMode: AppMode
    midiMode: MidiMode
    musicSystem: MusicSystem
    playableTracks: number[]
    activeTracks: number[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeActiveNotes: (
        activeNotes: (currentActiveNotes: ActiveNote[]) => MidiVisualizerActiveNote[]
    ) => void
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onMidiInputChange: React.Dispatch<React.SetStateAction<MIDIInput | null>>
    onMidiModeChange: React.Dispatch<React.SetStateAction<MidiMode>>
}

/*
    This component takes a while to paint.
    React.memo was used to avoid unnecessary re-renders
*/

export const Settings = React.memo(function Settings({
    appMode,
    midiMode,
    musicSystem,
    playableTracks,
    activeTracks,
    onChangeMusicSystem,
    onChangeAppMode,
    onChangeInstrument,
    onChangeActiveTracks,
    onMidiInputChange,
    onMidiModeChange,
}: SettingsProps) {
    function handleClick() {
        onMidiModeChange((midiMode) => {
            switch (midiMode) {
                case 'autoplay':
                    return 'wait'
                case 'wait':
                    return 'autoplay'
            }
        })
    }

    return (
        <div className="settings">
            {playableTracks.length > 1 ? (
                <MidiTrackSelector
                    activeTracks={activeTracks}
                    playableTracks={playableTracks}
                    onChangeActiveTracks={onChangeActiveTracks}
                />
            ) : null}
            <Button onClick={handleClick}>{midiMode}</Button>
            <MusicSystemSelector onChange={onChangeMusicSystem} musicSystem={musicSystem} />
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <InstrumentSelector onChange={onChangeInstrument} />
            <MidiInputSelector onMidiInputChange={onMidiInputChange} />
        </div>
    )
})
