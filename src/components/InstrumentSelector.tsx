import { Select } from './generics/Select'
import React from 'react'
import { MIDI_INSTRUMENTS } from '../utils/const'
import { Instrument } from '../types'

interface InstrumentSelectorProps {
    onChange: (instrument: Instrument) => void
}

export function InstrumentSelector({ onChange }: InstrumentSelectorProps) {
    return (
        <Select name="instruments" onChange={(event) => onChange(event.target.value)}>
            {MIDI_INSTRUMENTS.map((instrument) => (
                <option value={instrument} key={instrument}>
                    {instrument}
                </option>
            ))}
        </Select>
    )
}
