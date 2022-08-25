import { IMidiFile, IMidiNoteOffEvent, IMidiNoteOnEvent } from 'midi-json-parser-worker'
import { VisualizerNoteEvent } from '../types'
import {
    isNoteOffEvent as checkIsNoteOffEvent,
    isNoteOnEvent as checkIsNoteOnEvent,
    MidiFactory,
} from '../../../utils'
import { VisualizerEventsFactory } from './VisualizerEventsFactory'
import { MsPerBeat } from '../../../types'
import { SectionOfEvents } from '../types'
import { Dimensions } from '../types/Dimensions'

export class VisualizerFileParserFactory extends VisualizerEventsFactory {
    #notesBeingProcessed: VisualizerNoteEvent[]
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
        this.#notesBeingProcessed = []
    }

    #processNoteOnEvent = (event: IMidiNoteOnEvent, deltaAcc: number) => {
        const partialMidiVisualizerNoteEvent = this.getPartialVisualizerNoteEvent(event, deltaAcc)

        this.#notesBeingProcessed.push(partialMidiVisualizerNoteEvent)
    }

    #processNoteOffEvent = (
        event: IMidiNoteOffEvent | IMidiNoteOnEvent,
        deltaAcc: number,
        sectionsOfEvents: SectionOfEvents[]
    ) => {
        const key = MidiFactory.Note(event).getKey()
        const partialMidiVisualizerNoteEventIndex = this.#notesBeingProcessed.findIndex(
            (note) => note.key === key
        )

        if (partialMidiVisualizerNoteEventIndex !== -1) {
            const partialMidiVisualizerNoteEvent = {
                ...this.#notesBeingProcessed[partialMidiVisualizerNoteEventIndex],
            }
            const finalMidiVisualizerNoteEvent = this.getFinalVisualizerNoteEvent(
                partialMidiVisualizerNoteEvent,
                deltaAcc
            )
            this.#addVisualizerNoteEventToSection(finalMidiVisualizerNoteEvent, sectionsOfEvents)
            this.#notesBeingProcessed.splice(partialMidiVisualizerNoteEventIndex, 1)
        }
    }

    #addVisualizerNoteEventToSection = (
        visualizerNoteEvent: VisualizerNoteEvent,
        sectionsOfEvents: SectionOfEvents[]
    ) => {
        const startingSection = Math.floor(visualizerNoteEvent.startingTime / this.#msPerSection) // arrays start at 0, so we use floor to get number below
        const endingSection = Math.floor(
            (visualizerNoteEvent.startingTime + visualizerNoteEvent.duration) / this.#msPerSection
        )

        for (let i = startingSection; i <= endingSection; i++) {
            const indexSection = sectionsOfEvents.findIndex((section) => section[i])
            if (indexSection >= 0) {
                sectionsOfEvents[indexSection] = {
                    [i]: [...sectionsOfEvents[indexSection][i], visualizerNoteEvent],
                }
            } else {
                sectionsOfEvents.push({ [i]: [visualizerNoteEvent] })
            }
        }
    }

    parseMidiJson = (midiJson: IMidiFile) => {
        const { tracks } = midiJson
        let events: SectionOfEvents[][] = []

        tracks.forEach((track) => {
            let deltaAcc = 0
            this.#notesBeingProcessed = []
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
                    this.#processNoteOnEvent(event, deltaAcc)
                } else if (isNoteOffEvent) {
                    this.#processNoteOffEvent(event, deltaAcc, sectionsOfEvents)
                }
            })

            events.push(sectionsOfEvents)
        })

        return events
    }
}
