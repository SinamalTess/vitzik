import { MsPerBeat } from '@/types'
import { IMidiFile } from 'midi-json-parser-worker'
import { VisualizerEvent } from '../types'
import { MidiJsonParser } from './MidiJsonParser'
import { Dimensions } from '../types/Dimensions'
import { Section } from '../classes/Section'
import { getArrayOfNumbers } from '../utils/getArrayOfNumbers'
import { LoopEvent } from '../classes/LoopEvent'
import { NoteEvent } from '../classes/NoteEvent'
import { Coordinates } from '../classes/Coordinates'
import { DampPedalEvent } from '../classes/DampPedalEvent'

export class DataFactory extends MidiJsonParser {
    #height: number
    #msPerSection: number
    #midiFileEvents: Section[][]
    #allEvents: Section[]
    #thirdEvents: Section[]

    constructor(
        containerDimensions: Dimensions,
        msPerSection: number,
        midiMetas: {
            allMsPerBeat: MsPerBeat[]
            ticksPerBeat: number
        },
        midiFile: IMidiFile
    ) {
        super(containerDimensions, msPerSection, midiMetas)

        this.#height = containerDimensions.height
        this.#msPerSection = msPerSection
        this.#midiFileEvents = this.#getMidiFileEvents(midiFile)
        this.#allEvents = this.getEventsForTracks(getArrayOfNumbers(midiFile.tracks.length))
        this.#thirdEvents = []
    }

    #getMidiFileEvents = (midiFile: IMidiFile) => this.parse(midiFile)

    getAllEvents = (): Section[] => [...this.#allEvents]

    getNoteEvents = (): Section[] =>
        this.#allEvents.map((section) => {
            const noteEvents = Section.getNoteEvents(section)
            const { index } = section

            return new Section(index, noteEvents)
        })

    getEventsBySectionIndex = (sections: Section[], index: number) => {
        const section = this.#findSectionByIndex(index.toString(), sections)

        if (section) {
            const { events } = section

            return events.map((visualizerEvent) => {
                const { x, y, h, w } = visualizerEvent.coordinates
                const computedY = y - index * this.#height
                visualizerEvent.coordinates = new Coordinates(x, computedY, w, h)

                return visualizerEvent
            })
        } else {
            return []
        }
    }

    #findIndexSectionByIndex = (index: string, sections: Section[]) =>
        sections.findIndex((section) => section.index === index)

    #findSectionByIndex = (index: string, sections: Section[]) =>
        sections.find((section) => section.index === index)

    getIndexSectionFromTime = (time: number) => Math.floor(time / this.#msPerSection).toString()

    #isTimestampWithinEvent = (timestamp: number, event: VisualizerEvent) =>
        timestamp > event.startingTime && timestamp < event.startingTime + event.duration

    #cutEventAtTime = (event: VisualizerEvent, splitTime: number): VisualizerEvent[] => {
        const ySplit = this.getYFromStartingTime(splitTime)
        const { x, y, w, h } = event.coordinates
        const { metas } = event
        const coordinates1 = new Coordinates(x, y, w, ySplit - y)
        const metas1 = { ...metas, duration: splitTime - event.duration }
        const coordinates2 = new Coordinates(x, ySplit, w, h - (ySplit - y))
        const metas2 = { ...metas, duration: splitTime - event.duration, startingTime: splitTime }

        if (event instanceof NoteEvent) {
            return [
                new NoteEvent(coordinates1, metas1, event.note),
                new NoteEvent(coordinates2, metas2, event.note),
            ]
        } else if (event instanceof LoopEvent) {
            return [new LoopEvent(coordinates1, metas1), new LoopEvent(coordinates2, metas2)]
        } else {
            return [
                new DampPedalEvent(coordinates1, metas1),
                new DampPedalEvent(coordinates2, metas2),
            ]
        }
    }

    #getEventsAfterCutByLoopTimestamps = (section: Section) => {
        let currentEventsCopy: VisualizerEvent[] = []
        let thirdEvents: VisualizerEvent[] = []
        const { index } = section
        const { events } = section
        const thirdEventsSection = this.#findSectionByIndex(index, this.#thirdEvents)

        if (thirdEventsSection) {
            const { events: thirdEvents } = thirdEventsSection
            const loopTimestamps = thirdEvents.filter((event) => event instanceof LoopEvent)

            events.forEach((event) => {
                const isCutByLoopTimestamp = loopTimestamps.some(({ startingTime }) =>
                    this.#isTimestampWithinEvent(startingTime, event)
                )
                if (isCutByLoopTimestamp) {
                    loopTimestamps.forEach(({ startingTime }) => {
                        const isTimestampWithinEvent = this.#isTimestampWithinEvent(
                            startingTime,
                            event
                        )

                        if (isTimestampWithinEvent) {
                            const cutEvents = this.#cutEventAtTime(event, startingTime)
                            currentEventsCopy.push(...cutEvents)
                        }
                    })
                } else {
                    currentEventsCopy.push(event)
                }
            })
        } else {
            currentEventsCopy = [...events]
        }

        return [currentEventsCopy, thirdEvents]
    }

    getEventsForTracks = (activeTracks: number[]) => {
        const haveActiveTracks = activeTracks.length
        const haveMidiFileEvents = this.#midiFileEvents.length
        const requestInvalidActiveTracksNb = activeTracks.length > this.#midiFileEvents.length

        if (!haveActiveTracks || !haveMidiFileEvents || requestInvalidActiveTracksNb) {
            return []
        }

        let mergedSections: Section[] = []
        const thirdEventsAdded: VisualizerEvent[] = []

        const activeTracksSections = activeTracks
            .map((track) => this.#midiFileEvents[track])
            .flat(1)

        activeTracksSections.forEach((section) => {
            const { index } = section
            let newEvents: VisualizerEvent[] = []

            if (this.#thirdEvents) {
                const [currentEventsCopy, thirdEvents] =
                    this.#getEventsAfterCutByLoopTimestamps(section)

                // This avoids duplicating the thirdEvents on multiple tracks
                const newThirdEvents = thirdEvents.filter(
                    (thirdEvent) =>
                        !thirdEventsAdded.some(
                            (event) => event.startingTime === thirdEvent.startingTime
                        )
                )

                newEvents = [...currentEventsCopy, ...newThirdEvents]

                thirdEventsAdded.push(...newThirdEvents)
            }

            this.updateOrCreateSection(mergedSections, newEvents, index)
        })

        return mergedSections
    }

    setEventsForTracks = (activeTracks: number[]) => {
        this.#allEvents = this.getEventsForTracks(activeTracks)
    }

    updateOrCreateSection = (sections: Section[], newEvents: VisualizerEvent[], index: string) => {
        const indexExistingSection = this.#findIndexSectionByIndex(index, sections)
        const sectionAlreadyExists = indexExistingSection >= 0

        if (sectionAlreadyExists) {
            const { events } = sections[indexExistingSection]
            sections[indexExistingSection] = new Section(index, [...events, ...newEvents])
        } else {
            const section = new Section(index, [...newEvents])
            sections.push(section)
        }
    }

    #addThirdEvent = (event: VisualizerEvent) => {
        const { startingTime } = event
        const indexSection = this.getIndexSectionFromTime(startingTime)

        this.updateOrCreateSection(this.#thirdEvents, [event], indexSection)
    }

    clearThirdEvents = () => {
        this.#thirdEvents = []
    }

    addLoopTimeStampEvent = (time: number) => {
        const event = this.getLoopTimestampEvent(time)
        this.#addThirdEvent(event)
    }
}
