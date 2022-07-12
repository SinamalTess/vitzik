import { SideBar } from '../generics/SideBar'
import { MusicSystemSelector } from '../MusicSystemSelector'
import { InstrumentSelector } from '../InstrumentSelector'
import React from 'react'
import { Instrument, InstrumentUserFriendlyName, MidiMetas, MusicSystem } from '../../types'
import './ExtraSettingsPanel.scss'
import { MidiTrackList } from '../MidiTrackList'
import { Icon } from '../generics/Icon'
import { instrumentToIcon } from '../../utils/instruments'

interface ExtraSettingsPanelProps {
    isOpen: boolean
    userInstrument: InstrumentUserFriendlyName
    musicSystem: MusicSystem
    midiMetas: MidiMetas | null
    activeTracks: number[]
    initialInstruments: Instrument[]
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
    initialInstruments,
    onClose,
    onChangeMusicSystem,
    onChangeActiveTracks,
    onChangeInstrument,
}: ExtraSettingsPanelProps) {
    const playableTracks = midiMetas?.tracksMetas.filter((track) => track.isPlayable) ?? []
    const userInstrumentIcon = instrumentToIcon(userInstrument)
    return (
        <SideBar open={isOpen} onClose={onClose}>
            <div className="extra-settings">
                {midiMetas ? (
                    <>
                        <h4>File infos</h4>
                        <div>Ticks per beat : {midiMetas.ticksPerBeat}</div>
                        <div>Format : {midiMetas.format}</div>
                        <h4>User Instrument</h4>
                        <div className="user-instrument">
                            <Icon size={50} name={userInstrumentIcon} />
                            <InstrumentSelector
                                onChange={onChangeInstrument}
                                value={userInstrument}
                            />
                        </div>
                        <h4>Music System</h4>
                        <MusicSystemSelector
                            onChange={onChangeMusicSystem}
                            musicSystem={musicSystem}
                        />
                    </>
                ) : null}

                <h4>Tracks</h4>
                <MidiTrackList
                    playableTracks={playableTracks}
                    activeTracks={activeTracks}
                    initialInstruments={initialInstruments}
                    onChangeActiveTracks={onChangeActiveTracks}
                />
            </div>
        </SideBar>
    )
}
