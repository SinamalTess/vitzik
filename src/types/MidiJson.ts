import { IMidiNoteOffEvent, IMidiNoteOnEvent, TMidiEvent } from 'midi-json-parser-worker'

export type MidiJsonNote = IMidiNoteOffEvent | IMidiNoteOnEvent

export function isNoteOnEvent(note: TMidiEvent): note is IMidiNoteOnEvent {
    return 'noteOn' in note
}

export function isNoteOffEvent(note: TMidiEvent): note is IMidiNoteOffEvent {
    return 'noteOff' in note
}
