import { IMidiNoteOffEvent, IMidiNoteOnEvent } from 'midi-json-parser-worker'

export type MidiJsonNote = IMidiNoteOffEvent | IMidiNoteOnEvent

export function isNoteOnEvent(note: MidiJsonNote): note is IMidiNoteOnEvent {
    return 'noteOn' in note
}
