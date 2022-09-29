import { NoteEvent } from '../classes/NoteEvent'
import { LoopEvent } from '../classes/LoopEvent'
import { DampPedalEvent } from '../classes/DampPedalEvent'

export type VisualizerEventType = 'note' | 'loopTimestamp' | 'dampPedal'

export interface Coordinates {
    w: number
    h: number
    x: number
    y: number
}

export type VisualizerEvent = NoteEvent | LoopEvent | DampPedalEvent
