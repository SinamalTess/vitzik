import React from 'react'
import './trackinfos.scss'

interface TrackInfosPros {
    title: string
}

export function TrackInfos({ title }: TrackInfosPros) {
    return (
        <div className="track">
            {title.endsWith('.mid')
                ? title.slice(0, title.length - '.mid'.length)
                : title}
        </div>
    )
}
