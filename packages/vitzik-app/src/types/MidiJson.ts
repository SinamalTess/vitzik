import { IMidiNoteOffEvent, IMidiNoteOnEvent } from 'midi-json-parser-worker'

export type MidiJsonNote = IMidiNoteOffEvent | IMidiNoteOnEvent
