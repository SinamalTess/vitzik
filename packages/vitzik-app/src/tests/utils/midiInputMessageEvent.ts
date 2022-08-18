import { AlphabeticalNote } from '../../types'
import { noteToKey } from '../../utils'
import { MIDI_MESSAGE_CONTROL } from '../../utils/const/midi_message_controls'
import { MidiInputMock } from '../mocks/requestMIDIAccess'
import { act } from '@testing-library/react'

export const dispatchMidiInputMessageEvent = async (
    midiInput: MidiInputMock,
    note: AlphabeticalNote,
    noteOn = true
) => {
    const key = noteToKey(note)
    const velocity = 100
    await act(() => {
        midiInput.dispatchEvent.forEach((callback) => {
            callback({
                data: [
                    noteOn ? MIDI_MESSAGE_CONTROL.NOTE_ON : MIDI_MESSAGE_CONTROL.NOTE_OFF,
                    key,
                    velocity,
                ],
            })
        })
    })
}
