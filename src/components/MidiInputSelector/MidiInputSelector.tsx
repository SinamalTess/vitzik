import React, { useEffect, useState } from 'react'
import { Icon } from '../_presentational/Icon'
import { Select } from '../_presentational/Select'
import { Tooltip } from '../_presentational/Tooltip'
import './MidiInputSelector.scss'

interface MidiInputSelectorProps {
    onMidiInputChange: React.Dispatch<React.SetStateAction<MIDIInput | null>>
}

export function MidiInputSelector({ onMidiInputChange }: MidiInputSelectorProps) {
    const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])

    useEffect(() => {
        function onMIDIFailure(msg: string) {
            console.error('Failed to get MIDI access - ' + msg)
        }

        function onMIDISuccess(midiAccess: MIDIAccess) {
            // @ts-ignore
            const inputs: MIDIInput[] = [...midiAccess.inputs.values()] // turn into array

            setMidiInputs(inputs)
            onMidiInputChange(inputs[0])
        }

        // @ts-ignore
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    }, [onMidiInputChange])

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedInput = event.target.value
        const input = midiInputs.find((e) => e.id === selectedInput)
        if (input) {
            onMidiInputChange(input)
        }
    }

    return midiInputs.length ? (
        <Select onChange={handleChange}>
            {midiInputs.map((midiInput) => (
                <option
                    value={midiInput.id}
                    key={midiInput.id}
                >{`${midiInput.name} - ${midiInput.manufacturer}`}</option>
            ))}
        </Select>
    ) : (
        <span className="midi-input--not-found">
            <Tooltip showOnHover>
                <Icon name="usb">No input found</Icon>
                Try connecting an instrument to your computer via USB
            </Tooltip>
        </span>
    )
}