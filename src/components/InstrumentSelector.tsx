import { Select } from './generics/Select'
import React from 'react'
import { MIDI_INSTRUMENTS } from '../utils/const'
import { Instrument } from '../types'

interface InstrumentSelectorProps {
    onChange: (instrument: Instrument) => void
}

/*
    This component shows a large list that takes a long time to paint.
    React.memo was used to avoid unnecessary re-renders
*/

export const InstrumentSelector = React.memo(function InstrumentSelector({
    onChange,
}: InstrumentSelectorProps) {
    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        onChange(event.target.value as Instrument)
    }

    return (
        <Select onChange={handleChange}>
            {MIDI_INSTRUMENTS.map((instrument) => (
                <option value={instrument} key={instrument}>
                    {instrument}
                </option>
            ))}
        </Select>
    )
})
