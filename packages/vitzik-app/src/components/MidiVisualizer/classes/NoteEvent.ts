import { VisualizerEvent, VisualizerEventMetas } from './VisualizerEvent'
import { Coordinates } from './Coordinates'
import { MidiInputActiveNote } from '@/types'

type NoteEventMetas = Pick<VisualizerEventMetas, 'channel' | 'startingTime' | 'duration'>

export class NoteEvent extends VisualizerEvent {
    #note: MidiInputActiveNote

    constructor(coordinates: Coordinates, metas: NoteEventMetas, note: MidiInputActiveNote) {
        const { channel, startingTime, duration } = metas
        super(coordinates, {
            eventType: 'note',
            duration,
            channel,
            startingTime,
        })

        this.#note = note
    }

    set note(value: MidiInputActiveNote) {
        this.#note = value
    }

    get note() {
        return this.#note
    }
}
