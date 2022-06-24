import { Instrument } from './Instrument'

export interface MidiInfos {
    ticksPerBeat: number
    msPerBeat: number
    midiDuration: number
    playableTracksIndexes: number[]
    initialInstruments: Instrument[]
    format: number
}
