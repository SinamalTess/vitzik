import { SideBar } from '../generics/SideBar'
import { MusicSystemSelector } from '../MusicSystemSelector'
import { InstrumentSelector } from '../InstrumentSelector'
import React from 'react'
import { Instrument, MidiMetas, MusicSystem } from '../../types'
import './ExtraSettingsPanel.scss'
import { MidiTrackList } from '../MidiTrackList'

interface ExtraSettingsPanelProps {
    isOpen: boolean
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
    return (
        <SideBar open={isOpen} onClose={onClose}>
            <div className="extra-settings">
                {midiMetas ? (
                    <>
                        <h4>Main Instrument</h4>
                        <InstrumentSelector onChange={onChangeInstrument} />
                        <h4>File infos</h4>
                        <span>Ticks per beat : {midiMetas.ticksPerBeat}</span>
                        <span>Format : {midiMetas.format}</span>
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
