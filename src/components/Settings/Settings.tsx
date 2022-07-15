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
import { MIDI_INPUT_CHANNEL } from '../../utils/const'

interface SettingsProps {
    appMode: AppMode
    midiMode: MidiMode
    midiMetas: MidiMetas | null
    musicSystem: MusicSystem
    activeTracks: number[]
    isMidiImported: boolean
    activeInstruments: Instrument[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onMidiInputChange: React.Dispatch<React.SetStateAction<MIDIInput | null>>
    onMidiModeChange: React.Dispatch<React.SetStateAction<MidiMode>>
    onMute: React.Dispatch<React.SetStateAction<boolean>>
}

export const Settings = React.memo(function Settings({
    appMode,
    midiMode,
    midiMetas,
    musicSystem,
    activeTracks,
    isMidiImported,
    activeInstruments,
    onChangeMusicSystem,
    onChangeAppMode,
    onChangeInstrument,
    onChangeActiveTracks,
    onMidiInputChange,
    onMidiModeChange,
    onMute,
}: SettingsProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const userInstrument = activeInstruments.find(
        (instrument) => instrument.channel === MIDI_INPUT_CHANNEL
    )

    const userInstrumentName: InstrumentUserFriendlyName = userInstrument
        ? userInstrument.name
        : 'Acoustic Grand Keyboard'

    function handleMidiModeClick() {
        onMidiModeChange((midiMode) => {
            switch (midiMode) {
                case 'autoplay':
                    onMute(true)
                    return 'wait'
                case 'wait':
                    onMute(false)
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
        <div className="settings" role="toolbar">
            {isMidiImported ? (
                <Tooltip showOnHover>
                    <Switch isOn={midiMode === 'autoplay'} onClick={handleMidiModeClick}>
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
                activeInstruments={activeInstruments}
                userInstrument={userInstrumentName}
                onClose={handleCloseExtraSettings}
                onChangeMusicSystem={onChangeMusicSystem}
                onChangeActiveTracks={onChangeActiveTracks}
                onChangeInstrument={onChangeInstrument}
            />
        </div>
    )
})
