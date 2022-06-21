export interface MidiInfos {
    ticksPerBeat: number
    msPerBeat: number
    trackDuration: number
    playableTracksIndexes: number[]
    initialChannelInstruments: Map<number, string>
    format: number
}
