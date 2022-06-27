import React from 'react'
import './MidiTitle.scss'

interface MidiTrackInfosPros {
    midiTitle: string
}

function normalizeTitle(title: string) {
    const normalizedTitle = title.replace('_', ' ')
    const results = normalizedTitle.match(/.midi|.mid/) ?? []
    if (results.length > 0) {
        return normalizedTitle.slice(0, normalizedTitle.length - results[0].length)
    }
    return normalizedTitle
}

export function MidiTitle({ midiTitle }: MidiTrackInfosPros) {
    return (
        <div className="track">
            <p className="track__title">{normalizeTitle(midiTitle)}</p>
        </div>
    )
}
