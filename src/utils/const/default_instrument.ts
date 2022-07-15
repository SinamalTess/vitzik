import { NOTE_NAMES } from './note_names'
import { Instrument } from '../../types'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from './midi_user_channel'

export const DEFAULT_KEYBOARD_INSTRUMENT: Instrument = {
    name: 'Acoustic Grand Keyboard',
    channel: KEYBOARD_CHANNEL,
    index: 1,
    notes: new Set(NOTE_NAMES.alphabetical),
    timestamp: 0,
    delta: 0,
}

export const DEFAULT_MIDI_INSTRUMENT: Instrument = {
    ...DEFAULT_KEYBOARD_INSTRUMENT,
    channel: MIDI_INPUT_CHANNEL,
}

export const DEFAULT_INSTRUMENTS = [DEFAULT_KEYBOARD_INSTRUMENT, DEFAULT_MIDI_INSTRUMENT]
