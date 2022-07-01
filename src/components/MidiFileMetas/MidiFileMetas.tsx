import React from 'react'
import { MidiMetas } from '../../types'
import './MidiFileInfos.scss'
import { MidiTitle } from '../MidiTitle'
import { MIDI_CHANNEL_COLORS } from '../../utils/const'
import { List } from '../generics/List'
import { ListItem } from '../generics/ListItem'
import { msPerBeatToBeatPerMin } from '../../utils'
import { MidiVisualizerCoordinates } from '../Visualizer/MidiVisualizerCoordinates'

interface MidiInfosProps {
    midiMetas: MidiMetas
    midiTitle: string
    midiCurrentTime: number
}

export function MidiFileMetas({ midiMetas, midiTitle, midiCurrentTime }: MidiInfosProps) {
    const { ticksPerBeat, format, initialInstruments, allMsPerBeat } = midiMetas
    const msPerBeat = MidiVisualizerCoordinates.getMsPerBeatFromTime(
        allMsPerBeat,
        midiCurrentTime
    ).value

    return (
        <div className="midifile-infos pd-md">
            <MidiTitle midiTitle={midiTitle} />
            <span>Ticks per beat : {ticksPerBeat}</span>
            <span>Format : {format}</span>
            <span>Ms per beat : {msPerBeat}</span>
            <span>BPM : {msPerBeatToBeatPerMin(msPerBeat)}</span>
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