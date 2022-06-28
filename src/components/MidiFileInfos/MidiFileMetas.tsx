import React from 'react'
import { MidiMetas } from '../../types'
import './MidiFileInfos.scss'
import { MidiTitle } from '../MidiTitle'
import { MIDI_CHANNEL_COLORS } from '../../utils/const'
import { List } from '../generics/List'
import { ListItem } from '../generics/ListItem'

interface MidiInfosProps {
    midiMetas: MidiMetas
    midiTitle: string
}

export function MidiFileMetas({ midiMetas, midiTitle }: MidiInfosProps) {
    const { ticksPerBeat, format, initialInstruments, msPerBeat, beatsPerMin } = midiMetas
    return (
        <div className="midifile-infos pd-md">
            <MidiTitle midiTitle={midiTitle} />
            <span>Ticks per beat : {ticksPerBeat}</span>
            <span>Format : {format}</span>
            <span>Ms per beat : {msPerBeat}</span>
            <span>BPM : {beatsPerMin.toFixed(3)}</span>
            <List>
                {initialInstruments.map(({ channel, name }) => (
                    <ListItem
                        style={{ color: MIDI_CHANNEL_COLORS[channel] }}
                        key={`${name}-${channel}`}
                    >
                        {channel} : {name}
                    </ListItem>
                ))}
            </List>
        </div>
    )
}
