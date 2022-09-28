import { isNoteEvent, VisualizerEvent } from '../types'

export class Section {
    index: string
    events: VisualizerEvent[]

    constructor(index: string, events: VisualizerEvent[]) {
        this.index = index
        this.events = events
    }

    static getNoteEvents = (section: Section) =>
        section.events.filter((event) => isNoteEvent(event))
}
