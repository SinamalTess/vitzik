import React from 'react'
import { MidiInfos } from '../types'
import './MidiFileInfos.scss'
import { MidiTitle } from './MidiTitle'
import { CHANNElS_COLORS } from '../utils/const/channel_colors'

interface MidiInfosProps {
    midiInfos: MidiInfos
    midiTitle: string
}

export function MidiFileInfos({ midiInfos, midiTitle }: MidiInfosProps) {
    const { ticksPerBeat, format, initialChannelInstruments, msPerBeat, playableTracksIndexes } =
        midiInfos
    const channelInstruments = Array.from(initialChannelInstruments)
    return (
        <div className="midifile-infos pd-md">
            <MidiTitle midiTitle={midiTitle} />
            <span>Ticks per beat : {ticksPerBeat}</span>
            <span>Format : {format}</span>
            <span>Ms per beat : {msPerBeat}</span>
            <span>Playable tracks : {playableTracksIndexes.length}</span>
            <ul>
                {channelInstruments.map(([channel, instrument]) => (
                    <li style={{ color: CHANNElS_COLORS[channel] }}>
                        {channel} : {instrument}
                    </li>
                ))}
            </ul>
        </div>
    )
}
