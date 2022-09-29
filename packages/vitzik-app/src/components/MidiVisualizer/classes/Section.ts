import { VisualizerEvent } from '../types'
import { NoteEvent } from './NoteEvent'

export class Section {
    index: string
    events: VisualizerEvent[]

    constructor(index: string, events: VisualizerEvent[]) {
        this.index = index
        this.events = events
    }

    static getNoteEvents = (section: Section) =>
        section.events.filter((event) => event instanceof NoteEvent)
}
