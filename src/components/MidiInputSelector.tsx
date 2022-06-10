import React from 'react'
import { Icon } from './generics/Icon'
import { Select } from './generics/Select'

interface MidiInputSelectorProps {
    midiInputs: MIDIInput[]
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export type onChangeMidiInput = (event: React.ChangeEvent<HTMLSelectElement>) => void

//TODO: align the icon and animation + color

export function MidiInputSelector({ midiInputs, onChange }: MidiInputSelectorProps) {
    return midiInputs.length ? (
        <Select name="midiInputs" onChange={onChange}>
            {midiInputs.map((midiInput) => (
                <option
                    value={midiInput.id}
                    key={midiInput.id}
                >{`${midiInput.name} - ${midiInput.manufacturer}`}</option>
            ))}
        </Select>
    ) : (
        <>
            <Icon name="frequency">No input found</Icon>
        </>
    )
}
