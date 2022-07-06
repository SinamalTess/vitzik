import { SideBar } from '../generics/SideBar'
import { MusicSystemSelector } from '../MusicSystemSelector'
import { MidiTrackSelector } from '../MidiTrackSelector'
import { InstrumentSelector } from '../InstrumentSelector'
import React from 'react'
import { Instrument, MusicSystem } from '../../types'
import { List } from '../generics/List'
import {
    MIDI_CHANNEL_COLORS,
    MIDI_INSTRUMENTS,
    MIDI_INSTRUMENTS_FLUIDR3_GM,
} from '../../utils/const'
import { ListItem } from '../generics/ListItem'
import { Icon } from '../generics/Icon'
import { IconName } from '../generics/types'

interface ExtraSettingsPanelProps {
    isOpen: boolean
    musicSystem: MusicSystem
    onClose: () => void
    playableTracks: number[]
    activeTracks: number[]
    initialInstruments: Instrument[]
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
    initialInstruments,
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
            <h2>Main Instrument : </h2>
            <InstrumentSelector onChange={onChangeInstrument} />
            <h2>Channels : </h2>
            <List>
                {initialInstruments.map(({ channel, name }) => {
                    const InstrumentIndex = MIDI_INSTRUMENTS.findIndex(
                        (midiInstrument) => midiInstrument === name
                    )
                    const iconName =
                        'instrument-' +
                        MIDI_INSTRUMENTS_FLUIDR3_GM[InstrumentIndex].toLowerCase().replace(
                            /_/g,
                            '-'
                        )
                    return (
                        <ListItem
                            style={{ color: MIDI_CHANNEL_COLORS[channel] }}
                            key={`${name}-${channel}`}
                        >
                            <Icon size={50} name={iconName as IconName} /> {channel} : {name}
                        </ListItem>
                    )
                })}
            </List>
        </SideBar>
    )
}
