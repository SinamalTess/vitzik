import {
    IMidiNoteOffEvent,
    IMidiNoteOnEvent,
    IMidiSetTempoEvent,
    TMidiEvent,
} from 'midi-json-parser-worker'
import {
    IMidiKeySignatureEvent,
    IMidiProgramChangeEvent,
    IMidiTimeSignatureEvent,
    IMidiTrackNameEvent,
} from 'midi-json-parser-worker/src/interfaces'

export const isNoteOnEvent = (note: TMidiEvent): note is IMidiNoteOnEvent => 'noteOn' in note

export const isNoteOffEvent = (note: TMidiEvent): note is IMidiNoteOffEvent => 'noteOff' in note

export const isProgramChangeEvent = (event: TMidiEvent): event is IMidiProgramChangeEvent =>
    'programChange' in event

export const isSetTempoEvent = (event: TMidiEvent): event is IMidiSetTempoEvent =>
    'setTempo' in event

export const isTimeSignatureEvent = (event: TMidiEvent): event is IMidiTimeSignatureEvent =>
    'timeSignature' in event

export const isKeySignatureEvent = (event: TMidiEvent): event is IMidiKeySignatureEvent =>
    'keySignature' in event

export const isTrackNameEvent = (event: TMidiEvent): event is IMidiTrackNameEvent =>
    'trackName' in event
