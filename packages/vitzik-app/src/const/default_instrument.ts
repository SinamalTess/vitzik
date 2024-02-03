import { NOTE_NAMES } from './note_names'
import { ActiveInstrument, Instrument } from '@/types'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from './midi_channels'

export const DEFAULT_KEYBOARD_INSTRUMENT: ActiveInstrument = {
    name: 'Acoustic Grand Keyboard',
    channel: KEYBOARD_CHANNEL,
    index: 1,
    notes: new Set(NOTE_NAMES.alphabetical),
    timestamp: 0,
    delta: 0,
    isDampPedalOn: false,
}

export const DEFAULT_MIDI_INSTRUMENT: ActiveInstrument = {
    ...DEFAULT_KEYBOARD_INSTRUMENT,
    channel: MIDI_INPUT_CHANNEL,
}

export const DEFAULT_INSTRUMENTS = [DEFAULT_KEYBOARD_INSTRUMENT, DEFAULT_MIDI_INSTRUMENT]

export const instrumentsToActiveInstruments = (instruments: Instrument[]): ActiveInstrument[] =>
    instruments.map((instrument) => ({
        ...instrument,
        isDampPedalOn: false,
    }))
export const activeInstrumentsToInstruments = (
    activeInstruments: ActiveInstrument[]
): Instrument[] =>
    activeInstruments.map(({ index, timestamp, channel, name, notes, delta }) => ({
        timestamp,
        channel,
        name,
        notes,
        delta,
        index,
    }))
