import { MidiInputActiveNote, MidiJsonNote } from '../types'
import { keyToNote } from './notes'
import { isNoteOnEvent } from './midi_events'

export class MidiNoteFactory {
    note: MidiJsonNote
    constructor(note: MidiJsonNote) {
        this.note = note
    }

    getMetas = (): MidiInputActiveNote => {
        const { channel } = this.note
        const actualChannel = channel + 1
        const key = this.getKey()
        const name = keyToNote(key)
        const velocity = this.getVelocity()

        return {
            key,
            name,
            velocity,
            channel: actualChannel,
        }
    }

    getKey = () =>
        isNoteOnEvent(this.note) ? this.note.noteOn.noteNumber : this.note.noteOff.noteNumber

    getVelocity = () =>
        isNoteOnEvent(this.note) ? this.note.noteOn.velocity : this.note.noteOff.velocity
}
