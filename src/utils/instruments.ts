import { InstrumentUserFriendlyName } from '../types'
import { IconName } from '../components/generics/types'
import { MIDI_INSTRUMENTS, MIDI_INSTRUMENTS_FLUIDR3_GM } from './const'

export const instrumentToIcon = (instrumentName: InstrumentUserFriendlyName): IconName => {
    const InstrumentIndex = MIDI_INSTRUMENTS.findIndex(
        (midiInstrument) => midiInstrument === instrumentName
    )
    return ('instrument-' +
        MIDI_INSTRUMENTS_FLUIDR3_GM[InstrumentIndex].toLowerCase().replace(/_/g, '-')) as IconName
}
