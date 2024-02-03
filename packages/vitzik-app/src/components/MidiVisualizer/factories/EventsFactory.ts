import { MsPerBeat } from '../../../types'
import findLast from 'lodash/findLast'
import { Keyboard } from '../../../utils/Keyboard'
import { MidiFactory } from '../../../utils'
import { IMidiNoteOnEvent } from 'midi-json-parser-worker'
import { Dimensions } from '../types/Dimensions'
import { IMidiControlChangeEvent } from 'midi-json-parser-worker/src/interfaces'
import { KEYBOARD_CHANNEL } from '../../../const'
import { Coordinates } from '../classes/Coordinates'
import { VisualizerEvent } from '../classes/VisualizerEvent'
import { DampPedalEvent } from '../classes/DampPedalEvent'
import { LoopEvent } from '../classes/LoopEvent'
import { NoteEvent } from '../classes/NoteEvent'

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

    getLoopTimestampEvent = (startingTime: number) => {
        const y = this.getYFromStartingTime(startingTime)
        const coordinates = new Coordinates(0, y, this.#width, 1)
        const metas = {
            startingTime,
            channel: KEYBOARD_CHANNEL,
        }

        return new LoopEvent(coordinates, metas)
    }

    getPartialDampPedalEvent = (event: IMidiControlChangeEvent, deltaAcc: number) => {
        const startingTime = this.#deltaToTime(deltaAcc)
        const { channel } = event
        const y = this.getYFromStartingTime(startingTime)
        const coordinates = new Coordinates(0, y, this.#width, 0)
        const metas = {
            startingTime,
            channel,
        }

        return new DampPedalEvent(coordinates, metas)
    }

    getFinalEvent = (event: VisualizerEvent, deltaAcc: number) => {
        const { x, y, w } = event.coordinates
        const { startingTime, channel } = event
        const duration = this.#deltaToTime(deltaAcc) - event.startingTime
        const h = this.#getHFromDuration(duration)
        const coordinates = new Coordinates(x, y, w, h)
        const metas = {
            duration,
            startingTime,
            channel,
        }

        if (event instanceof DampPedalEvent) {
            return new DampPedalEvent(coordinates, metas)
        } else if (event instanceof NoteEvent) {
            const note = event.note
            return new NoteEvent(coordinates, metas, note)
        } else {
            return new LoopEvent(coordinates, metas)
        }
    }

    getPartialVisualizerNoteEvent = (event: IMidiNoteOnEvent, deltaAcc: number) => {
        const note = MidiFactory.Note(event).getMetas()
        const { name, channel } = note
        const startingTime = this.#deltaToTime(deltaAcc)
        const y = this.getYFromStartingTime(startingTime)
        const defaultMetas = {
            startingTime,
            channel,
            duration: 0,
        }

        if (name) {
            const { width, x } = new Keyboard(this.#width).getKeyStyles(name)
            const coordinates = new Coordinates(x, y, width, 0)

            return new NoteEvent(coordinates, defaultMetas, note)
        } else {
            const coordinates = new Coordinates(0, y, 0, 0)
            /*
                Some notes don't have associated names because they are just frequencies.
                See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
                We won't render them visually, but they need to be played.
                Therefore, we pass a 'width' and 'x' of 0 --> to skip rendering
                But the 'y' and 'h' must be correct --> to play at the right timing
            */

            return new NoteEvent(coordinates, defaultMetas, note)
        }
    }
}
