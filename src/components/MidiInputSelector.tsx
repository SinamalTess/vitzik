import React, { useEffect, useState } from 'react'
import { Icon } from './generics/Icon'
import { Select } from './generics/Select'
import { keyToNote } from '../utils'
import { ActiveNote } from '../App'

//TODO: align the icon and animation + color

const isMidiMessageEvent = (event: Event): event is MIDIMessageEvent => 'data' in event

interface MidiInputSelectorProps {
    onChangeActiveNotes: (activeNotes: (currentActiveNotes: ActiveNote[]) => ActiveNote[]) => void
}

function onMIDIFailure(msg: string) {
    console.error('Failed to get MIDI access - ' + msg)
}

export function MidiInputSelector({ onChangeActiveNotes }: MidiInputSelectorProps) {
    const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])

    useEffect(() => {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    }, [])

    function onMIDISuccess(midiAccess: MIDIAccess) {
        const inputs: MIDIInput[] = Array.from(midiAccess.inputs.values())

        setMidiInputs(inputs)

        if (inputs[0]) {
            inputs[0].onmidimessage = getMIDIMessage
        }
    }

    function removeNote(note: ActiveNote) {
        onChangeActiveNotes((notes) =>
            notes.filter((currentNote) => currentNote.name !== note.name)
        )
    }

    function getMIDIMessage(message: Event) {
        if (!isMidiMessageEvent(message)) return

        const key = message.data[1]
        const command = message.data[0]
        const name = keyToNote(message.data[1])
        const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

        const note = {
            name,
            velocity,
            key,
        }

        switch (command) {
            case 144: // noteOn
                velocity > 0 ? onChangeActiveNotes((notes) => [...notes, note]) : removeNote(note)
                break
            case 128: // noteOff
                removeNote(note)
                break
        }
    }

    function handleChangeMidiInput(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedInput = event.target.value
        const input = midiInputs.find((e) => e.id === selectedInput)
        if (input) {
            input.onmidimessage = getMIDIMessage
        }
    }

    return midiInputs.length ? (
        <Select name="midiInputs" onChange={handleChangeMidiInput}>
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
