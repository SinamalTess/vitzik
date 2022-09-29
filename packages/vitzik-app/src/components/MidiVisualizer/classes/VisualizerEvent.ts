import { VisualizerEventType } from '../types'
import { Coordinates } from './Coordinates'

export interface VisualizerEventMetas {
    eventType: VisualizerEventType
    startingTime: number
    duration: number
    channel: number
}

export class VisualizerEvent {
    #coordinates: Coordinates
    eventType: VisualizerEventType
    startingTime: number
    duration: number
    channel: number
    uniqueId: string

    constructor(coordinates: Coordinates, metas: VisualizerEventMetas) {
        const { eventType, duration, startingTime, channel } = metas

        this.#coordinates = coordinates
        this.eventType = eventType
        this.duration = duration
        this.startingTime = startingTime
        this.channel = channel
        this.uniqueId = VisualizerEvent.generateUniqueId()
    }

    static generateUniqueId = () => `${Math.random()}`

    set coordinates(newCoordinates: Coordinates) {
        this.#coordinates = newCoordinates
    }

    get coordinates() {
        return this.#coordinates
    }

    set metas(newMetas: VisualizerEventMetas) {
        const { eventType, duration, startingTime, channel } = newMetas

        this.eventType = eventType
        this.duration = duration
        this.startingTime = startingTime
        this.channel = channel
    }

    get metas(): VisualizerEventMetas & { uniqueId: string } {
        return {
            eventType: this.eventType,
            duration: this.duration,
            startingTime: this.startingTime,
            channel: this.channel,
            uniqueId: this.uniqueId,
        }
    }
}
