import React from 'react'
import './MidiTrackTitle.scss'

interface MidiTrackInfosPros {
    midiTrackTitle: string
}

export function MidiTrackTitle({ midiTrackTitle }: MidiTrackInfosPros) {
    return (
        <div className="track">
            <p className="track__title">
                {midiTrackTitle.endsWith('.mid')
                    ? midiTrackTitle.slice(0, midiTrackTitle.length - '.mid'.length)
                    : midiTrackTitle}
            </p>
        </div>
    )
}
