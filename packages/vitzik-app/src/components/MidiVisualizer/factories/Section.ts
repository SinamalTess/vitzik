import { VisualizerEvent } from '../types'

export class Section {
    index: string
    events: VisualizerEvent[]

    constructor(index: string, events: VisualizerEvent[]) {
        this.index = index
        this.events = events
    }
}
