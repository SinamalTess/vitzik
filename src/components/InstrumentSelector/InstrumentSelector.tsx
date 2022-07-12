import { Select } from '../generics/Select'
import React from 'react'
import { MIDI_INSTRUMENTS, NOTE_NAMES } from '../../utils/const'
import { Instrument, InstrumentUserFriendlyName } from '../../types'

interface InstrumentSelectorProps {
    value: string
    onChange: React.Dispatch<React.SetStateAction<Instrument[]>>
}

export function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const name = event.target.value as InstrumentUserFriendlyName
        const instrument = {
            name,
            index: MIDI_INSTRUMENTS.findIndex((instrument) => instrument === name),
            channel: 16,
            notes: NOTE_NAMES.alphabetical as unknown as string[],
        }

        onChange((instruments) => {
            const indexInstrument = instruments.findIndex(
                ({ channel }) => channel === instrument.channel
            )
            if (indexInstrument < 0) return instruments
            const copyInstruments = [...instruments]
            copyInstruments[indexInstrument] = instrument
            return copyInstruments
        })
    }

    return (
        <>
            <Select onChange={handleChange} value={value}>
                {MIDI_INSTRUMENTS.map((instrument) => (
                    <option value={instrument} key={instrument}>
                        {instrument}
                    </option>
                ))}
            </Select>
        </>
    )
}
