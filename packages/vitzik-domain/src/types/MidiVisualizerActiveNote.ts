import { AlphabeticalNote } from './Notes'
import { MIDI_INPUT_CHANNEL } from '../utils/const'

export interface MidiInputActiveNote {
    name?: AlphabeticalNote
    velocity: number
    key: number
    channel: number
}

export interface MidiVisualizerActiveNote {
    name?: AlphabeticalNote
    velocity: number
    id: string
    duration: number
    key: number
    channel: number
    startingTime: number
}

export type ActiveNote = MidiInputActiveNote | MidiVisualizerActiveNote

export const isMidiVisualizerActiveNote = (
    activeNote: ActiveNote
): activeNote is MidiVisualizerActiveNote =>
    'id' in activeNote && activeNote.channel !== MIDI_INPUT_CHANNEL
