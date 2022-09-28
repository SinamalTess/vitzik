import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker'
import { VisualizerEvent } from '../types'
import {
    isControlChangeEvent,
    isNoteOffEvent,
    isNoteOffEvent as checkIsNoteOffEvent,
    isNoteOnEvent,
    isNoteOnEvent as checkIsNoteOnEvent,
    MidiFactory,
} from '../../../utils'
import { EventsFactory } from './EventsFactory'
import { MsPerBeat } from '../../../types'
import { SectionOfEvents } from '../types'
import { Dimensions } from '../types/Dimensions'

export class MidiJsonParser extends EventsFactory {
    #eventsBeingProcessed: VisualizerEvent[]
    #msPerSection: number
    #msPerBeatValue: number

    constructor(
        containerDimensions: Dimensions,
        msPerSection: number,
        midiMetas: {
            allMsPerBeat: MsPerBeat[]
            ticksPerBeat: number
        }
    ) {
        super(containerDimensions, msPerSection, midiMetas)

        this.#msPerSection = msPerSection
        this.#msPerBeatValue = MidiFactory.Time().getInitialMsPerBeatValue(midiMetas.allMsPerBeat)
        this.#eventsBeingProcessed = []
    }

    #processOnEvent = (event: TMidiEvent, deltaAcc: number) => {
        if (isNoteOnEvent(event)) {
            const partialEvent = this.getPartialVisualizerNoteEvent(event, deltaAcc)
            this.#eventsBeingProcessed.push(partialEvent)
        } else if (isControlChangeEvent(event)) {
            const partialEvent = this.getPartialDampPedalEvent(event, deltaAcc)
            this.#eventsBeingProcessed.push(partialEvent)
        }
    }

    #findIndexEventBeingProcessed = (event: TMidiEvent) => {
        if (isNoteOnEvent(event) || isNoteOffEvent(event)) {
            const key = MidiFactory.Note(event).getKey()
            return this.#eventsBeingProcessed.findIndex(
                (event) => 'key' in event && event.key === key
            )
        } else {
            return this.#eventsBeingProcessed.findIndex((event) => event.eventType === 'dampPedal')
        }
    }

    #processOffEvent = (
        event: TMidiEvent,
        deltaAcc: number,
        sectionsOfEvents: SectionOfEvents[]
    ) => {
        const indexEventBeingProcessed = this.#findIndexEventBeingProcessed(event)

        if (indexEventBeingProcessed !== -1) {
            const eventBeingProcessed = {
                ...this.#eventsBeingProcessed[indexEventBeingProcessed],
            }

            const finalEvent = this.getFinalEvent(eventBeingProcessed, deltaAcc)
            this.#addEventToSection(finalEvent, sectionsOfEvents)
            this.#eventsBeingProcessed.splice(indexEventBeingProcessed, 1)
        }
    }

    #addEventToSection = (
        visualizerEvent: VisualizerEvent,
        sectionsOfEvents: SectionOfEvents[]
    ) => {
        const startingSection = Math.floor(visualizerEvent.startingTime / this.#msPerSection) // arrays start at 0, so we use floor to get number below
        const endingSection = Math.floor(
            (visualizerEvent.startingTime + visualizerEvent.duration) / this.#msPerSection
        )

        for (let i = startingSection; i <= endingSection; i++) {
            const indexSection = sectionsOfEvents.findIndex((section) => section[i])
            if (indexSection >= 0) {
                sectionsOfEvents[indexSection] = {
                    [i]: [...sectionsOfEvents[indexSection][i], visualizerEvent],
                }
            } else {
                sectionsOfEvents.push({ [i]: [visualizerEvent] })
            }
        }
    }

    parse = (midiJson: IMidiFile) => {
        const { tracks } = midiJson
        let events: SectionOfEvents[][] = []

        tracks.forEach((track) => {
            let deltaAcc = 0
            this.#eventsBeingProcessed = []
            let sectionsOfEvents: SectionOfEvents[] = []

            track.forEach((event) => {
                deltaAcc = deltaAcc + event.delta
                const lastMsPerBeat = this.findMsPerBeatFromDelta(deltaAcc)
                const isNoteOnEvent = checkIsNoteOnEvent(event)
                const isNoteOffEvent =
                    checkIsNoteOffEvent(event) || (isNoteOnEvent && event.noteOn.velocity === 0)

                if (lastMsPerBeat && lastMsPerBeat.value !== this.#msPerBeatValue) {
                    this.#msPerBeatValue = lastMsPerBeat.value
                }

                if (isNoteOnEvent) {
                    this.#processOnEvent(event, deltaAcc)
                } else if (isNoteOffEvent) {
                    this.#processOffEvent(event, deltaAcc, sectionsOfEvents)
                } else if (isControlChangeEvent(event)) {
                    const { controlChange } = event
                    const { value, type } = controlChange
                    if (type === 64) {
                        // damper pedal
                        if (value >= 64) {
                            // ON
                            this.#processOnEvent(event, deltaAcc)
                        } else {
                            // OFF
                            this.#processOffEvent(event, deltaAcc, sectionsOfEvents)
                        }
                    }
                }
            })

            events.push(sectionsOfEvents)
        })

        return events
    }
}
