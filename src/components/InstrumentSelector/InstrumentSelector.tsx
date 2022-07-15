import { Select } from '../_presentational/Select'
import React from 'react'
import {
    MIDI_INSTRUMENTS,
    DEFAULT_MIDI_INSTRUMENT,
    DEFAULT_KEYBOARD_INSTRUMENT,
} from '../../utils/const'
import { Instrument, InstrumentUserFriendlyName } from '../../types'

interface InstrumentSelectorProps {
    value: string
    onChange: React.Dispatch<React.SetStateAction<Instrument[]>>
}

export function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const name = event.target.value as InstrumentUserFriendlyName
        const newUserInstruments = [
            {
                ...DEFAULT_MIDI_INSTRUMENT,
                name,
            },
            {
                ...DEFAULT_KEYBOARD_INSTRUMENT,
                name,
            },
        ]

        onChange((instruments) => {
            const copyInstruments = [...instruments]
            newUserInstruments.forEach((instrument) => {
                const indexInstrument = instruments.findIndex(
                    ({ channel }) => channel === instrument.channel
                )
                if (indexInstrument >= 0) {
                    copyInstruments[indexInstrument] = instrument
                }
            })
            return copyInstruments
        })
    }

    return (
        <Select onChange={handleChange} value={value}>
            {MIDI_INSTRUMENTS.map((instrument) => (
                <option value={instrument} key={instrument}>
                    {instrument}
                </option>
            ))}
        </Select>
    )
}
