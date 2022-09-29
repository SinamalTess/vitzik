import { VisualizerEvent, VisualizerEventMetas } from './VisualizerEvent'
import { Coordinates } from './Coordinates'

type DampPedalEventMetas = Pick<VisualizerEventMetas, 'channel' | 'startingTime'>

export class DampPedalEvent extends VisualizerEvent {
    constructor(coordinates: Coordinates, metas: DampPedalEventMetas) {
        const { channel, startingTime } = metas

        super(coordinates, {
            eventType: 'dampPedal',
            duration: 0,
            channel,
            startingTime,
        })
    }
}
