import React from 'react'
import { MidiMetas } from '../../types'
import './MidiFileInfos.scss'
import { msPerBeatToBeatPerMin } from '../../utils'
import { MidiVisualizerCoordinates } from '../Visualizer/MidiVisualizerCoordinates'

interface MidiInfosProps {
    midiMetas: MidiMetas
    midiCurrentTime: number
}

export function MidiFileMetas({ midiMetas, midiCurrentTime }: MidiInfosProps) {
    const { ticksPerBeat, format, allMsPerBeat } = midiMetas
    const msPerBeat = MidiVisualizerCoordinates.getMsPerBeatFromTime(
        allMsPerBeat,
        midiCurrentTime
    ).value

    return (
        <div className="midifile-infos pd-md">
            <span>Ticks per beat : {ticksPerBeat}</span>
            <span>Format : {format}</span>
            <span>Ms per beat : {msPerBeat}</span>
            <span>BPM : {Math.round(msPerBeatToBeatPerMin(msPerBeat))}</span>
        </div>
    )
}
