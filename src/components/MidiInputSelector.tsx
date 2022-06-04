import React from 'react'
import { Icon } from './generics/Icon'

interface MidiInputSelectorProps {
    inputs: MIDIInput[]
    onChangeInput: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

// TODO: align the icon and animation + color

export function MidiInputSelector({ inputs, onChangeInput }: MidiInputSelectorProps) {
    return inputs.length ? (
        <>
            <select name="midiInputs" onChange={onChangeInput}>
                {inputs.map((input) => (
                    <option
                        value={input.id}
                        key={input.id}
                    >{`${input.name} - ${input.manufacturer}`}</option>
                ))}
            </select>
        </>
    ) : (
        <>
            <Icon name="frequency">No input found</Icon>
        </>
    )
}
