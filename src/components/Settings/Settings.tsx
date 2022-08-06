import React, { useCallback, useContext, useState } from 'react'
import './Settings.scss'
import {
    MusicSystem,
    MidiMode,
    AppMode,
    MidiMetas,
    InstrumentUserFriendlyName,
    Instrument,
    MidiAccessMode,
    LoopTimes,
} from '../../types'
import { ModeSelector } from '../ModeSelector'
import { MidiInputSelector } from '../MidiInputSelector'
import { Switch } from '../_presentational/Switch'
import { Button } from '../_presentational/Button'
import { ExtraSettingsPanel } from './ExtraSettingsPanel'
import { Tooltip } from '../_presentational/Tooltip'
import { MIDI_INPUT_CHANNEL } from '../../utils/const'
import { Divider } from '../_presentational/Divider'
import { BpmSelector } from '../BpmSelector'
import { useKeyboardShortcut } from '../../_hooks/useKeyboardShortcut'
import { ShortcutsContext } from '../ShortcutsContext'

interface SettingsProps {
    showNotes: boolean
    worker: Worker
    appMode: AppMode
    midiMode: MidiMode
    midiAccessMode: MidiAccessMode
    midiMetas: MidiMetas | null
    musicSystem: MusicSystem
    activeTracks: number[]
    midiSpeedFactor: number
    isEditingLoop: boolean
    loadedInstrumentPlayers: InstrumentUserFriendlyName[]
    activeInstruments: Instrument[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeAppMode: (mode: AppMode) => void
    onChangeInstrument: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onMidiInputChange: React.Dispatch<React.SetStateAction<MIDIInput | null>>
    onMidiOutputChange: React.Dispatch<React.SetStateAction<MIDIOutput | null>>
    onMidiModeChange: React.Dispatch<React.SetStateAction<MidiMode>>
    onMidiAccessModeChange: React.Dispatch<React.SetStateAction<MidiAccessMode>>
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onChangeIsEditingLoop: React.Dispatch<React.SetStateAction<boolean>>
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimes>>
    onMute: React.Dispatch<React.SetStateAction<boolean>>
    onChangeShowNotes: React.Dispatch<React.SetStateAction<boolean>>
}

const BASE_CLASS = 'settings'

export function Settings({
    worker,
    showNotes,
    appMode,
    midiMode,
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
    onChangeLoopTimes,
    onMidiModeChange,
    onMute,
    onChangeShowNotes,
}: SettingsProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { setShortcuts } = useContext(ShortcutsContext)
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
                    return 'wait'
                case 'wait':
                    onMute(false)
                    return 'autoplay'
            }
        })
    }

    function handleClickOnExtraSettings() {
        setIsOpen((isOpen) => !isOpen)
        setShortcuts((shortcuts) =>
            shortcuts.filter((activeShortcut) => activeShortcut !== 'wheel')
        )
    }

    const handleCloseExtraSettings = useCallback(
        function handleCloseExtraSettings() {
            setIsOpen(false)
            setShortcuts((shortcuts) => [...shortcuts, 'wheel'])
        },
        [setShortcuts]
    )

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
        onChangeLoopTimes([null, null])
    }

    return (
        <div className={BASE_CLASS} role="toolbar" data-testid={'settings'}>
            {midiMetas ? (
                <>
                    <Tooltip showOnHover>
                        <Button
                            icon={'loop'}
                            onClick={handleClickOnLoop}
                            variant="text"
                            color={isEditingLoop ? 'primary' : 'secondary'}
                        ></Button>
                        {`${
                            isEditingLoop
                                ? 'Exit the loop mode (l)'
                                : 'Set a loop over a section (l)'
                        }`}
                    </Tooltip>
                    <Divider orientation="vertical" />
                    <BpmSelector
                        worker={worker}
                        midiSpeedFactor={midiSpeedFactor}
                        onChangeMidiSpeedFactor={onChangeMidiSpeedFactor}
                        allMsPerBeat={midiMetas.allMsPerBeat}
                    />
                    <Divider orientation="vertical" />
                    <Tooltip showOnHover>
                        <Switch isOn={midiMode === 'autoplay'} onClick={handleMidiModeClick}>
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
            <Button icon={'settings'} onClick={handleClickOnExtraSettings}>
                {nbTracks ? ` ${nbTracks} track${nbTracks > 1 ? 's' : ''}` : null}
            </Button>
            <ModeSelector onChange={onChangeAppMode} appMode={appMode} />
            <MidiInputSelector
                onMidiInputChange={onMidiInputChange}
                onMidiOutputChange={onMidiOutputChange}
            />
            <ExtraSettingsPanel
                loadedInstrumentPlayers={loadedInstrumentPlayers}
                showNotes={showNotes}
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
            />
        </div>
    )
}
