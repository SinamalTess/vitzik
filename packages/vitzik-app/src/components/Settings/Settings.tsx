import React, { useState } from 'react'
import './Settings.scss'
import {
    MusicSystem,
    MidiPlayMode,
    AppMode,
    MidiMetas,
    InstrumentUserFriendlyName,
    MidiAccessMode,
    LoopTimestamps,
    ActiveInstrument,
} from '../../types'
import { AppModeSelector } from '../AppModeSelector'
import { MidiInputSelector } from '../MidiInputSelector'
import { Switch, Button, Divider, Tooltip } from 'vitzik-ui'
import { ExtraSettingsPanel } from './ExtraSettingsPanel'
import { MIDI_INPUT_CHANNEL } from '../../const'
import { BpmSelector } from '../BpmSelector'
import { useKeyboardShortcut } from '../../hooks'

interface SettingsProps {
    showNotes: boolean
    showDampPedal: boolean
    appMode: AppMode
    midiPlayMode: MidiPlayMode
    midiAccessMode: MidiAccessMode
    midiMetas: MidiMetas | null
    musicSystem: MusicSystem
    activeTracks: number[]
    midiSpeedFactor: number
    isEditingLoop: boolean
    loadedInstrumentPlayers: InstrumentUserFriendlyName[]
    activeInstruments: ActiveInstrument[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onMidiInputChange: React.Dispatch<React.SetStateAction<MIDIInput | null>>
    onMidiOutputChange: React.Dispatch<React.SetStateAction<MIDIOutput | null>>
    onMidiModeChange: React.Dispatch<React.SetStateAction<MidiPlayMode>>
    onMidiAccessModeChange: React.Dispatch<React.SetStateAction<MidiAccessMode>>
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onChangeIsEditingLoop: React.Dispatch<React.SetStateAction<boolean>>
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onMute: React.Dispatch<React.SetStateAction<boolean>>
    onChangeShowNotes: React.Dispatch<React.SetStateAction<boolean>>
    onChangeShowDampPedal: React.Dispatch<React.SetStateAction<boolean>>
}

const BASE_CLASS = 'settings'

export function Settings({
    showNotes,
    showDampPedal,
    appMode,
    midiPlayMode,
    midiAccessMode,
    midiMetas,
    musicSystem,
    activeTracks,
    isEditingLoop,
    midiSpeedFactor,
    activeInstruments,
    loadedInstrumentPlayers,
    onChangeMusicSystem,
    onChangeAppMode,
    onChangeInstrument,
    onChangeActiveTracks,
    onMidiInputChange,
    onMidiOutputChange,
    onMidiAccessModeChange,
    onChangeMidiSpeedFactor,
    onChangeIsEditingLoop,
    onChangeLoopTimestamps,
    onMidiModeChange,
    onMute,
    onChangeShowNotes,
    onChangeShowDampPedal,
}: SettingsProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const userInstrument = activeInstruments.find(
        (instrument) => instrument.channel === MIDI_INPUT_CHANNEL
    )
    const nbTracks = activeTracks.length

    const userInstrumentName: InstrumentUserFriendlyName = userInstrument
        ? userInstrument.name
        : 'Acoustic Grand Keyboard'

    useKeyboardShortcut('KeyL', () => {
        onChangeIsEditingLoop((isEditingLoops) => !isEditingLoops)
        clearLoop()
    })

    function handleMidiModeClick() {
        onMidiModeChange((midiMode) => {
            switch (midiMode) {
                case 'autoplay':
                    onMute(true)
                    return 'waitForValidInput'
                case 'waitForValidInput':
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

    function handleMidiAccessModeClick() {
        onMidiAccessModeChange((midiAccessMode) =>
            midiAccessMode === 'input' ? 'output' : 'input'
        )
    }

    function handleClickOnLoop() {
        onChangeIsEditingLoop((isEditingLoop) => !isEditingLoop)
        if (isEditingLoop) {
            clearLoop()
        }
    }

    function clearLoop() {
        onChangeLoopTimestamps([null, null])
    }

    return (
        <div className={BASE_CLASS} data-testid={'settings'}>
            {midiMetas ? (
                <>
                    <Tooltip showOnHover>
                        <Button
                            icon={'loop'}
                            onClick={handleClickOnLoop}
                            variant="text"
                            color={isEditingLoop ? 'primary' : 'secondary'}
                            aria-label={'loop'}
                        ></Button>
                        {`${
                            isEditingLoop
                                ? 'Exit the loop mode (l)'
                                : 'Set a loop over a section (l)'
                        }`}
                    </Tooltip>
                    <Divider variant="vertical" />
                    <BpmSelector
                        midiSpeedFactor={midiSpeedFactor}
                        onChangeMidiSpeedFactor={onChangeMidiSpeedFactor}
                        allMsPerBeat={midiMetas.allMsPerBeat}
                    />
                    <Divider variant="vertical" />
                    <Tooltip showOnHover>
                        <Switch isOn={midiPlayMode === 'autoplay'} onClick={handleMidiModeClick}>
                            Autoplay
                        </Switch>
                        <span>
                            Autoplay ON : Play the song without stopping
                            <br />
                            Autoplay OFF : Wait for you to play the right notes before moving
                            forward
                        </span>
                    </Tooltip>
                </>
            ) : null}
            <Button icon={'settings'} onClick={handleClickOnExtraSettings} aria-label={'settings'}>
                {nbTracks ? ` ${nbTracks} track${nbTracks > 1 ? 's' : ''}` : null}
            </Button>
            <AppModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector
                onMidiInputChange={onMidiInputChange}
                onMidiOutputChange={onMidiOutputChange}
            />
            <ExtraSettingsPanel
                loadedInstrumentPlayers={loadedInstrumentPlayers}
                showNotes={showNotes}
                showDampPedal={showDampPedal}
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
                onChangeShowNotes={onChangeShowNotes}
                onChangeShowDampPedal={onChangeShowDampPedal}
            />
        </div>
    )
}
