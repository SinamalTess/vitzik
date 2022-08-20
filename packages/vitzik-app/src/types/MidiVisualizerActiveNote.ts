import { AlphabeticalNote } from './Notes'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../utils/const'

export interface MidiInputActiveNote {
    name?: AlphabeticalNote
    velocity: number
    key: number
    channel: number
}

export interface MidiVisualizerActiveNote {
    name?: AlphabeticalNote
    velocity: number
    uniqueId: string
    duration: number
    key: number
    channel: number
    startingTime: number
}

export type ActiveNote = MidiInputActiveNote | MidiVisualizerActiveNote

export const isMidiVisualizerActiveNote = (
    activeNote: ActiveNote
): activeNote is MidiVisualizerActiveNote =>
    activeNote.channel !== MIDI_INPUT_CHANNEL && activeNote.channel !== KEYBOARD_CHANNEL
