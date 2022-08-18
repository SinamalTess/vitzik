import React, { useEffect, useState } from 'react'
// @ts-ignore
import { Icon, Select, Tooltip, Link } from 'vitzik-ui'
import './MidiInputSelector.scss'

interface MidiInputSelectorProps {
    onMidiInputChange: React.Dispatch<React.SetStateAction<MIDIInput | null>>
    onMidiOutputChange: React.Dispatch<React.SetStateAction<MIDIOutput | null>>
}

type MidiInputState = 'pending' | 'available' | 'error'

const BASE_CLASS = 'midi-input'

function onMIDIFailure(msg: string) {
    console.error('Failed to get MIDI access - ' + msg)
}

export function MidiInputSelector({
    onMidiInputChange,
    onMidiOutputChange,
}: MidiInputSelectorProps) {
    const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])
    const [midiOutputs, setMidiOutputs] = useState<MIDIOutput[]>([])
    const [state, setState] = useState<MidiInputState>('pending')

    useEffect(() => {
        function onMIDISuccess(midiAccess: MIDIAccess) {
            const inputs: MIDIInput[] = [...midiAccess.inputs.values()] // turn into array
            const outputs: MIDIOutput[] = [...midiAccess.outputs.values()] // turn into array

            if (inputs.length) {
                setMidiInputs(inputs)
                setMidiOutputs(outputs)
                onMidiInputChange(inputs[0])
                onMidiOutputChange(outputs[0])
                setState('available')
            }
        }

        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
        } else {
            setState('error')
        }
    }, [onMidiInputChange, onMidiOutputChange])

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedInput = event.target.value
        const input = midiInputs.find((e) => e.id === selectedInput)
        if (input) {
            onMidiInputChange(input)
        }
    }

    switch (state) {
        case 'pending':
            return (
                <span className={`${BASE_CLASS}`}>
                    <Tooltip showOnHover>
                        <Icon name="usb">No input found</Icon>
                        Try connecting an instrument to your computer via USB
                    </Tooltip>
                </span>
            )
        case 'available':
            return (
                <Select onChange={handleChange}>
                    {midiInputs.map((midiInput) => (
                        <option
                            value={midiInput.id}
                            key={midiInput.id}
                        >{`${midiInput.name} - ${midiInput.manufacturer}`}</option>
                    ))}
                </Select>
            )
        case 'error':
            return (
                <span className={`${BASE_CLASS} ${BASE_CLASS}--${state}`}>
                    <Tooltip showOnHover>
                        <Icon name="usb">Midi API not available</Icon>
                        <>
                            Your browser doesn't support the MIDI API. You can see the list of
                            supported browser
                            <Link href="https://caniuse.com/midi">here</Link>
                            .<br />
                            You can can still use the midi import feature, but connecting an
                            instrument via USB won't work.
                        </>
                    </Tooltip>
                </span>
            )
    }
}
