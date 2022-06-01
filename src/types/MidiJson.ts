export interface MidiJson {
    division: number

    format: number

    tracks: any[][]
}

export interface MidiJsonNote {
    channel: number
    delta: number
    noteOn?: {
        noteNumber: number
        velocity: number
    }
    noteOff?: {
        noteNumber: number
        velocity: number
    }
}
