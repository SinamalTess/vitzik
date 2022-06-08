import React from 'react'
import { Icon } from './generics/Icon'

interface MidiInputSelectorProps {
    midiInputs: MIDIInput[]
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export type onChangeMidiInput = (event: React.ChangeEvent<HTMLSelectElement>) => void

//TODO: align the icon and animation + color

export function MidiInputSelector({ midiInputs, onChange }: MidiInputSelectorProps) {
    return midiInputs.length ? (
        <>
            <select name="midiInputs" onChange={onChange}>
                {midiInputs.map((midiInput) => (
                    <option
                        value={midiInput.id}
                        key={midiInput.id}
                    >{`${midiInput.name} - ${midiInput.manufacturer}`}</option>
                ))}
            </select>
        </>
    ) : (
        <>
            <Icon name="frequency">No input found</Icon>
        </>
    )
}
