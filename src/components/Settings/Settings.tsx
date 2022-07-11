import React, { useState } from 'react'
import './Settings.scss'
import {
    Instrument,
    MusicSystem,
    MidiVisualizerActiveNote,
    MidiMode,
    AppMode,
    ActiveNote,
    MidiMetas,
} from '../../types'
import { ModeSelector } from '../ModeSelector'
import { MidiInputSelector } from '../MidiInputSelector'
import { Switch } from '../generics/Switch'
import { Button } from '../generics/Button'
import { ExtraSettingsPanel } from '../ExtraSettingsPanel'
import { Tooltip } from '../generics/Tooltip'

interface SettingsProps {
    appMode: AppMode
    midiMode: MidiMode
    midiMetas: MidiMetas | null
    musicSystem: MusicSystem
    activeTracks: number[]
    isMidiImported: boolean
    initialInstruments: Instrument[]
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

export function Settings({
    appMode,
    midiMode,
    midiMetas,
    musicSystem,
    activeTracks,
    isMidiImported,
    initialInstruments,
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
                <Tooltip showOnHover>
                    <Switch isOn={midiMode === 'autoplay'} onChange={handleChange}>
                        Autoplay
                    </Switch>
                    <span>
                        <div>Autoplay ON : Play the song without stopping</div>
                        <div>
                            Autoplay OFF : Wait for you to play the right notes before moving
                            forward
                        </div>
                    </span>
                </Tooltip>
            ) : null}
            <Button icon={'settings'} onClick={handleClick} />
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector onMidiInputChange={onMidiInputChange} />
            <ExtraSettingsPanel
                midiMetas={midiMetas}
                musicSystem={musicSystem}
                activeTracks={activeTracks}
                isOpen={isOpen}
                initialInstruments={initialInstruments}
                onClose={handleClose}
                onChangeMusicSystem={onChangeMusicSystem}
                onChangeActiveTracks={onChangeActiveTracks}
                onChangeInstrument={onChangeInstrument}
            />
        </div>
    )
}
