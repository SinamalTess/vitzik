import { IMidiNoteOffEvent, IMidiNoteOnEvent } from 'midi-json-parser-worker'

export type MidiJsonNote = IMidiNoteOffEvent | IMidiNoteOnEvent

export function isNoteOn(note: MidiJsonNote): note is IMidiNoteOnEvent {
    return (note as IMidiNoteOnEvent).noteOn !== undefined
}
