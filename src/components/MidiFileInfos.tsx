import React from 'react'
import { MidiInfos } from '../types'
import './MidiFileInfos.scss'
import { MidiTitle } from './MidiTitle'
import { CHANNElS_COLORS } from '../utils/const/channel_colors'
import { List } from './generics/List'
import { ListItem } from './generics/ListItem'

interface MidiInfosProps {
    midiInfos: MidiInfos
    midiTitle: string
}

export function MidiFileInfos({ midiInfos, midiTitle }: MidiInfosProps) {
    const { ticksPerBeat, format, initialChannelInstruments, msPerBeat } = midiInfos
    const channelInstruments = Array.from(initialChannelInstruments)
    return (
        <div className="midifile-infos pd-md">
            <MidiTitle midiTitle={midiTitle} />
            <span>Ticks per beat : {ticksPerBeat}</span>
            <span>Format : {format}</span>
            <span>Ms per beat : {msPerBeat}</span>
            <List>
                {channelInstruments.map(([channel, instrument]) => (
                    <ListItem
                        style={{ color: CHANNElS_COLORS[channel] }}
                        key={`${instrument}-${channel}`}
                    >
                        {channel} : {instrument}
                    </ListItem>
                ))}
            </List>
        </div>
    )
}
