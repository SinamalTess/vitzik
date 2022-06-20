import React from 'react'
import './MidiTrackTitle.scss'

interface MidiTrackInfosPros {
    midiTrackTitle: string
}

function normalizeTitle(title: string) {
    const normalizedTitle = title.replace('_', ' ')
    const results = normalizedTitle.match(/.midi|.mid/) ?? []
    if (results.length > 0) {
        return normalizedTitle.slice(0, normalizedTitle.length - results[0].length)
    }
    return normalizedTitle
}

export function MidiTrackTitle({ midiTrackTitle }: MidiTrackInfosPros) {
    return (
        <div className="track">
            <p className="track__title">{normalizeTitle(midiTrackTitle)}</p>
        </div>
    )
}
