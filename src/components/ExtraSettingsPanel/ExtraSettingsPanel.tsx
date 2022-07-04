import { SideBar } from '../generics/SideBar'
import { MusicSystemSelector } from '../MusicSystemSelector'
import { MidiTrackSelector } from '../MidiTrackSelector'
import { InstrumentSelector } from '../InstrumentSelector'
import React from 'react'
import { Instrument, MusicSystem } from '../../types'

interface ExtraSettingsPanelProps {
    isOpen: boolean
    musicSystem: MusicSystem
    onClose: () => void
    playableTracks: number[]
    activeTracks: number[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onChangeInstrument: React.Dispatch<React.SetStateAction<Instrument[]>>
}

export function ExtraSettingsPanel({
    isOpen,
    onClose,
    musicSystem,
    playableTracks,
    activeTracks,
    onChangeMusicSystem,
    onChangeActiveTracks,
    onChangeInstrument,
}: ExtraSettingsPanelProps) {
    return (
        <SideBar open={isOpen} onClose={onClose}>
            <MusicSystemSelector onChange={onChangeMusicSystem} musicSystem={musicSystem} />
            {playableTracks.length > 1 ? (
                <MidiTrackSelector
                    activeTracks={activeTracks}
                    playableTracks={playableTracks}
                    onChangeActiveTracks={onChangeActiveTracks}
                />
            ) : null}
            <InstrumentSelector onChange={onChangeInstrument} />
        </SideBar>
    )
}
