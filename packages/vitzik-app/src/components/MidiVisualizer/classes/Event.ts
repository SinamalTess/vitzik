import { Coordinates } from '../types'

export class Event {
    coordinates: Coordinates

    constructor(coordinates: Coordinates) {
        this.coordinates = coordinates
    }
}
