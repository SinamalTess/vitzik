import { MIDI_INSTRUMENTS } from '../utils/const'

export type InstrumentUserFriendlyName = typeof MIDI_INSTRUMENTS[number]

export interface Instrument {
    name: InstrumentUserFriendlyName
    index: number
    channel: number
    notes: string[]
}
