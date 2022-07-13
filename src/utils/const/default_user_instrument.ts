import { NOTE_NAMES } from './note_names'
import { Instrument } from '../../types'
import { MIDI_USER_CHANNEL } from './midi_user_channel'

export const DEFAULT_USER_INSTRUMENT: Instrument = {
    name: 'Acoustic Grand Keyboard',
    channel: MIDI_USER_CHANNEL,
    index: 1,
    notes: new Set(NOTE_NAMES.alphabetical),
    timestamp: 0,
    delta: 0,
}
