import { MIDI_INSTRUMENTS } from '../utils/const'
import { AlphabeticalNote } from './Notes'

export type InstrumentUserFriendlyName = typeof MIDI_INSTRUMENTS[number]

export interface Instrument {
    name: InstrumentUserFriendlyName
    index: number
    channel: number
    notes: AlphabeticalNote[]
}
