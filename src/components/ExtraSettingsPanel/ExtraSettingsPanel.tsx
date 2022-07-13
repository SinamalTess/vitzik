import { SideBar } from '../_presentational/SideBar'
import { MusicSystemSelector } from '../MusicSystemSelector'
import { InstrumentSelector } from '../InstrumentSelector'
import React from 'react'
import { Instrument, InstrumentUserFriendlyName, MidiMetas, MusicSystem } from '../../types'
import './ExtraSettingsPanel.scss'
import { MidiTrackList } from '../MidiTrackList'
import { Icon } from '../_presentational/Icon'
import { instrumentToIcon } from '../../utils/instruments'

interface ExtraSettingsPanelProps {
    isOpen: boolean
    userInstrument: InstrumentUserFriendlyName
    musicSystem: MusicSystem
    midiMetas: MidiMetas | null
    activeTracks: number[]
    activeInstruments: Instrument[]
    onClose: () => void
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onChangeInstrument: React.Dispatch<React.SetStateAction<Instrument[]>>
}

export function ExtraSettingsPanel({
    isOpen,
    userInstrument,
    musicSystem,
    midiMetas,
    activeTracks,
    activeInstruments,
    onClose,
    onChangeMusicSystem,
    onChangeActiveTracks,
    onChangeInstrument,
}: ExtraSettingsPanelProps) {
    const userInstrumentIcon = instrumentToIcon(userInstrument)
    const instruments = midiMetas?.instruments ?? []
    return (
        <SideBar open={isOpen} onClose={onClose}>
            <div className="extra-settings">
                <h4>User Instrument</h4>
                <div className="extra-settings__user-instrument">
                    <Icon size={50} name={userInstrumentIcon} />
                    <InstrumentSelector onChange={onChangeInstrument} value={userInstrument} />
                </div>
                {midiMetas ? (
                    <>
                        <h4>File infos</h4>
                        <div>Ticks per beat : {midiMetas.ticksPerBeat}</div>
                        <div>Format : {midiMetas.format}</div>
                        <h4>Music System</h4>
                        <MusicSystemSelector
                            onChange={onChangeMusicSystem}
                            musicSystem={musicSystem}
                        />
                        <h4>Tracks</h4>
                        <MidiTrackList
                            activeInstruments={activeInstruments}
                            tracks={midiMetas.tracksMetas}
                            activeTracks={activeTracks}
                            instruments={instruments}
                            onChangeActiveTracks={onChangeActiveTracks}
                        />
                    </>
                ) : null}
            </div>
        </SideBar>
    )
}
