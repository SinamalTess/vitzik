import { VisualizerEvent, VisualizerEventMetas } from './VisualizerEvent'
import { Coordinates } from './Coordinates'

type LoopEventMetas = Pick<VisualizerEventMetas, 'channel' | 'startingTime'>

export class LoopEvent extends VisualizerEvent {
    constructor(coordinates: Coordinates, metas: LoopEventMetas) {
        const { channel, startingTime } = metas

        super(coordinates, {
            eventType: 'loopTimestamp',
            duration: 0,
            channel,
            startingTime,
        })
    }
}
