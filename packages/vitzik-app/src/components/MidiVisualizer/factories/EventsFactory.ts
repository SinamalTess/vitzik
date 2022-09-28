import { MsPerBeat } from '../../../types'
import findLast from 'lodash/findLast'
import { Keyboard } from '../../../utils/Keyboard'
import { VisualizerEvent, VisualizerEventType } from '../types'
import { MidiFactory } from '../../../utils'
import { IMidiNoteOnEvent } from 'midi-json-parser-worker'
import { Dimensions } from '../types/Dimensions'
import { IMidiControlChangeEvent } from 'midi-json-parser-worker/src/interfaces'
import { KEYBOARD_CHANNEL } from '../../../utils/const'
import { Coordinates } from '../classes/Coordinates'

export class EventsFactory {
    #width: number
    #height: number
    #ratioSection: number
    #allMsPerBeat: MsPerBeat[]
    #ticksPerBeat: number

    constructor(
        containerDimensions: Dimensions,
        msPerSection: number,
        midiMetas: {
            allMsPerBeat: MsPerBeat[]
            ticksPerBeat: number
        }
    ) {
        this.#width = containerDimensions.width
        this.#height = containerDimensions.height
        this.#allMsPerBeat = midiMetas.allMsPerBeat
        this.#ratioSection = this.#height / msPerSection
        this.#ticksPerBeat = midiMetas.ticksPerBeat
    }

    findMsPerBeatFromDelta = (delta: number) =>
        findLast(this.#allMsPerBeat, (msPerBeat) => msPerBeat.delta <= delta)

    #deltaToTime = (delta: number) => {
        const lastMsPerBeat = this.findMsPerBeatFromDelta(delta)

        if (lastMsPerBeat) {
            const { timestamp, delta: lastDelta, value } = lastMsPerBeat
            return timestamp + ((delta - lastDelta) / this.#ticksPerBeat) * value
        }

        return 0
    }

    getYFromStartingTime = (startingTime: number) => this.#ratioSection * startingTime

    #getHFromDuration = (duration: number) => this.#ratioSection * duration

    getLoopTimestampEvent = (startingTime: number): VisualizerEvent => {
        const y = this.getYFromStartingTime(startingTime)
        const coordinates = new Coordinates(0, y, this.#width, 1)
        return {
            ...coordinates,
            eventType: 'loopTimestamp',
            startingTime,
            duration: 0,
            channel: KEYBOARD_CHANNEL,
        }
    }

    getPartialDampPedalEvent = (
        event: IMidiControlChangeEvent,
        deltaAcc: number
    ): VisualizerEvent => {
        const startingTime = this.#deltaToTime(deltaAcc)
        const { channel } = event
        const y = this.getYFromStartingTime(startingTime)
        const coordinates = new Coordinates(0, y, this.#width, 0)
        return {
            ...coordinates,
            startingTime,
            eventType: 'dampPedal',
            duration: 0,
            channel,
        }
    }

    getFinalEvent = (event: VisualizerEvent, deltaAcc: number) => {
        const duration = this.#deltaToTime(deltaAcc) - event.startingTime
        const h = this.#getHFromDuration(duration)

        return {
            ...event,
            h,
            duration,
        }
    }

    getPartialVisualizerNoteEvent = (event: IMidiNoteOnEvent, deltaAcc: number) => {
        const note = MidiFactory.Note(event).getMetas()
        const { name } = note
        const startingTime = this.#deltaToTime(deltaAcc)
        const y = this.getYFromStartingTime(startingTime)
        const defaultMetas = {
            startingTime,
            duration: 0,
            eventType: 'note' as VisualizerEventType,
            uniqueId: `${name}-${y}-${note.channel}-${Math.random()}`,
        }

        if (name) {
            const keyboardFactory = new Keyboard(this.#width)
            const { width, x } = keyboardFactory.getKeyStyles(name)
            const coordinates = new Coordinates(x, y, width, 0)

            return {
                ...coordinates,
                ...note,
                ...defaultMetas,
            }
        } else {
            const coordinates = new Coordinates(0, y, 0, 0)
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
