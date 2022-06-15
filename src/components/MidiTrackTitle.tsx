import React from 'react'
import './MidiTrackTitle.scss'

interface MidiTrackInfosPros {
    midiTrackTitle: string
}

function normalizeTitle(title: string) {
    const normalizedTitle = title.replace('_', ' ')
    return normalizedTitle.endsWith('.mid')
        ? normalizedTitle.slice(0, title.length - '.mid'.length)
        : normalizedTitle
}

export function MidiTrackTitle({ midiTrackTitle }: MidiTrackInfosPros) {
    return (
        <div className="track">
            <p className="track__title">{normalizeTitle(midiTrackTitle)}</p>
        </div>
    )
}
