export interface MidiInfos {
    ticksPerBeat: number
    msPerBeat: number
    midiDuration: number
    playableTracksIndexes: number[]
    initialChannelInstruments: Map<number, string>
    format: number
}
