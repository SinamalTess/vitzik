import React, { useState } from 'react'
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
import { MidiInputSelector } from '../MidiInputSelector'
import { Switch } from '../generics/Switch'
import { Button } from '../generics/Button'
import { ExtraSettingsPanel } from '../ExtraSettingsPanel'

interface SettingsProps {
    appMode: AppMode
    midiMode: MidiMode
    musicSystem: MusicSystem
    playableTracks: number[]
    activeTracks: number[]
    isMidiImported: boolean
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
    isMidiImported,
    onChangeMusicSystem,
    onChangeAppMode,
    onChangeInstrument,
    onChangeActiveTracks,
    onMidiInputChange,
    onMidiModeChange,
}: SettingsProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    function handleChange() {
        onMidiModeChange((midiMode) => {
            switch (midiMode) {
                case 'autoplay':
                    return 'wait'
                case 'wait':
                    return 'autoplay'
            }
        })
    }

    function handleClick() {
        setIsOpen((isOpen) => !isOpen)
    }

    function handleClose() {
        setIsOpen(false)
    }

    return (
        <div className="settings">
            {isMidiImported ? (
                <Switch isOn={midiMode === 'autoplay'} onChange={handleChange}>
                    Autoplay
                </Switch>
            ) : null}
            <Button icon={'settings'} onClick={handleClick} />
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector onMidiInputChange={onMidiInputChange} />
            <ExtraSettingsPanel
                musicSystem={musicSystem}
                activeTracks={activeTracks}
                isOpen={isOpen}
                playableTracks={playableTracks}
                onClose={handleClose}
                onChangeMusicSystem={onChangeMusicSystem}
                onChangeActiveTracks={onChangeActiveTracks}
                onChangeInstrument={onChangeInstrument}
            />
        </div>
    )
})
