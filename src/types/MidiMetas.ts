import { Instrument } from './Instrument'

export interface MsPerBeat {
    timestamp: number
    value: number
    delta: number
}

export interface TrackMetas {
    index: number
    names: string[]
    nbTicks: number // ticks = delta
    /*
        Time signature is defined as follows:
        4/4 would be four quarter-notes per Bar (MIDI default),
        4/2 would be four half-notes per Bar (or 8 quarter notes),
        4/8 would be four eighth-notes per Bar (or 2 quarter notes), and
        2/4 would be two quarter-notes per Bar.
    */
    timeSignature?: {
        denominator: number // Bottom number : How many quarter notes there are in a beat
        metronome: number
        numerator: number // Top number : Number of beats in a Bar
        thirtyseconds: number
    }
    keySignature?: {
        key: number
        scale: number
    }
    msPerBeat: MsPerBeat[]
    channels: Set<number>
    isPlayable: boolean
}

export interface MidiMetas {
    ticksPerBeat: number
    midiDuration: number
    instruments: Instrument[]
    format: number
    tracksMetas: TrackMetas[]
    allMsPerBeat: MsPerBeat[]
}
