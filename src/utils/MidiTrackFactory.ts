import { TMidiEvent } from 'midi-json-parser-worker'
import { isNoteOnEvent } from './midi_events'

export class MidiTrackFactory {
    track: TMidiEvent[]
    constructor(track: TMidiEvent[]) {
        this.track = track
    }

    isPlayable = () => this.track.some((event) => isNoteOnEvent(event))

    getNbTicks = () => this.track.reduce((delta, nextEvent) => delta + nextEvent.delta, 0)
}
