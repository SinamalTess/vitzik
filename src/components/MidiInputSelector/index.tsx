import React from 'react'

interface MidiInputSelectorProps {
    inputs: MIDIInput[]
    onChangeInput: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function MidiInputSelector({
    inputs,
    onChangeInput,
}: MidiInputSelectorProps) {
    return inputs.length ? (
        <>
            <label htmlFor="midiInputs">Choose a MIDI Input</label>
            <select name="midiInputs" id="midiInputs" onChange={onChangeInput}>
                {inputs.map((input) => (
                    <option
                        value={input.id}
                        key={input.id}
                    >{`${input.name} - ${input.manufacturer}`}</option>
                ))}
            </select>
        </>
    ) : (
        <div>No input found, try connecting an instrument to your laptop</div>
    )
}
