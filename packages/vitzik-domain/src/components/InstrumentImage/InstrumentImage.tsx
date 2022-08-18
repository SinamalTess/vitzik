import React from 'react'
import { InstrumentUserFriendlyName } from '../../types'

interface InstrumentImageProps {
    instrumentName: InstrumentUserFriendlyName
    size?: number
}

export function InstrumentImage({ instrumentName, size = 24 }: InstrumentImageProps) {
    return (
        <img
            className={'pd-r-md pd-l-md'}
            src={`img/svg/instruments/instrument_${instrumentName}.svg`}
            alt={`instrument ${instrumentName}`}
            style={{ width: size }}
        />
    )
}
