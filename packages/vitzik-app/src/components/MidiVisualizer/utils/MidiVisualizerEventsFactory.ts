import { MsPerBeat } from '../../../types'
import findLast from 'lodash/findLast'
import { KeyboardFactory } from '../../Keyboard/KeyboardFactory'
import { MidiVisualizerEventType, MidiVisualizerNoteEvent } from './MidiVisualizerEvents'
import { MidiFactory } from '../../../utils'
import { IMidiNoteOnEvent } from 'midi-json-parser-worker'

export class MidiVisualizerEventsFactory {
    width: number
    height: number
    ratioSection: number
    allMsPerBeat: MsPerBeat[]
    ticksPerBeat: number

    constructor(
        containerDimensions: {
            height: number
            width: number
        },
        msPerSection: number,
        midiMetas: {
            allMsPerBeat: MsPerBeat[]
            ticksPerBeat: number
        }
    ) {
        this.width = containerDimensions.width
        this.height = containerDimensions.height
        this.allMsPerBeat = midiMetas.allMsPerBeat
        this.ratioSection = this.height / msPerSection
        this.ticksPerBeat = midiMetas.ticksPerBeat
    }

    getMsPerBeatFromDelta = (delta: number) =>
        findLast(this.allMsPerBeat, (msPerBeat) => msPerBeat.delta <= delta)

    deltaToTime = (delta: number) => {
        const lastMsPerBeat = this.getMsPerBeatFromDelta(delta)

        if (lastMsPerBeat) {
            const { timestamp, delta: lastDelta, value } = lastMsPerBeat
            return timestamp + ((delta - lastDelta) / this.ticksPerBeat) * value
        }

        return 0
    }

    getFinalMidiVisualizerNoteEvent = (note: MidiVisualizerNoteEvent, deltaAcc: number) => {
        const duration = this.deltaToTime(deltaAcc) - note.startingTime
        const h = this.ratioSection * duration

        return {
            ...note,
            h,
            duration,
        }
    }

    getPartialMidiVisualizerNoteEvent = (event: IMidiNoteOnEvent, deltaAcc: number) => {
        const note = MidiFactory.Note(event).getMetas()
        const { name } = note
        const startingTime = this.deltaToTime(deltaAcc)
        const y = this.ratioSection * startingTime
        const defaultMetas = {
            startingTime,
            duration: 0,
            eventType: 'note' as MidiVisualizerEventType,
            uniqueId: `${name}-${y}-${note.channel}-${Math.random()}`,
        }

        if (name) {
            const keyboardFactory = new KeyboardFactory(this.width, 0)
            const { width, x } = keyboardFactory.getKeyStyles(name)
            const coordinates = { y, w: width, x, h: 0 }

            return {
                ...coordinates,
                ...note,
                ...defaultMetas,
            }
        } else {
            const coordinates = { y, w: 0, x: 0, h: 0 }
            /*
                Some notes don't have associated names because they are just frequencies.
                See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
                We won't render them visually, but they need to be played.
                Therefore, we pass a 'width' and 'x' of 0 --> to skip rendering
                But the 'y' and 'h' must be correct --> to play at the right timing
            */

            return {
                ...coordinates,
                ...note,
                ...defaultMetas,
            }
        }
    }
}
