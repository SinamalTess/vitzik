import { AlphabeticalNote } from '../../../types'

export type VisualizerEventType = 'note' | 'loopTimestamp' | 'dampPedal'

export const isNoteEvent = (event: VisualizerEvent): event is VisualizerNoteEvent =>
    event.eventType === 'note'

export const isLoopTimestampEvent = (event: VisualizerEvent): event is VisualizerEvent =>
    event.eventType === 'loopTimestamp'

export const isDampPedalEvent = (event: VisualizerEvent): event is VisualizerEvent =>
    event.eventType === 'dampPedal'

export interface Coordinates {
    w: number
    h: number
    x: number
    y: number
}

export interface VisualizerEventBase extends Coordinates {
    eventType: VisualizerEventType
    startingTime: number
    duration: number
    channel: number
}

export interface VisualizerNoteEvent extends VisualizerEventBase {
    // Some notes don't have associated names because they are just frequencies
    // See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
    name?: AlphabeticalNote
    key: number
    velocity: number
    startingTime: number
    uniqueId: string
}

export type VisualizerEvent = VisualizerNoteEvent | VisualizerEventBase
