import React, { useState } from 'react'
import './Settings.scss'
import {
    Instrument,
    MusicSystem,
    MidiMode,
    AppMode,
    MidiMetas,
    InstrumentUserFriendlyName,
} from '../../types'
import { ModeSelector } from '../ModeSelector'
import { MidiInputSelector } from '../MidiInputSelector'
import { Switch } from '../_presentational/Switch'
import { Button } from '../_presentational/Button'
import { ExtraSettingsPanel } from '../ExtraSettingsPanel'
import { Tooltip } from '../_presentational/Tooltip'
import { MIDI_USER_CHANNEL } from '../../utils/const'

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
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onMidiInputChange: React.Dispatch<React.SetStateAction<MIDIInput | null>>
    onMidiModeChange: React.Dispatch<React.SetStateAction<MidiMode>>
}

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
    const userInstrument = initialInstruments.find(
        (instrument) => instrument.channel === MIDI_USER_CHANNEL
    )

    const userInstrumentName: InstrumentUserFriendlyName = userInstrument
        ? userInstrument.name
        : 'Acoustic Grand Keyboard'

    function handleMidiModeChange() {
        onMidiModeChange((midiMode) => {
            switch (midiMode) {
                case 'autoplay':
                    return 'wait'
                case 'wait':
                    return 'autoplay'
            }
        })
    }

    function handleClickOnExtraSettings() {
        setIsOpen((isOpen) => !isOpen)
    }

    function handleCloseExtraSettings() {
        setIsOpen(false)
    }

    return (
        <div className="settings">
            {isMidiImported ? (
                <Tooltip showOnHover>
                    <Switch isOn={midiMode === 'autoplay'} onChange={handleMidiModeChange}>
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
            <Button icon={'settings'} onClick={handleClickOnExtraSettings} />
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector onMidiInputChange={onMidiInputChange} />
            <ExtraSettingsPanel
                midiMetas={midiMetas}
                musicSystem={musicSystem}
                activeTracks={activeTracks}
                isOpen={isOpen}
                initialInstruments={initialInstruments}
                userInstrument={userInstrumentName}
                onClose={handleCloseExtraSettings}
                onChangeMusicSystem={onChangeMusicSystem}
                onChangeActiveTracks={onChangeActiveTracks}
                onChangeInstrument={onChangeInstrument}
            />
        </div>
    )
}
