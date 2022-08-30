import { MsPerBeat } from '../../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { isNoteEvent, VisualizerEvent } from '../types'
import { VisualizerFileParserFactory } from './VisualizerFileParserFactory'
import { SectionOfEvents } from '../types'
import { Dimensions } from '../types/Dimensions'

export class VisualizerFactory extends VisualizerFileParserFactory {
    #height: number
    #msPerSection: number
    #initialEvents: SectionOfEvents[][]
    #allEvents: SectionOfEvents[]
    #thirdEvents: SectionOfEvents[]

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
        this.#initialEvents = this.#getInitialEvents(midiFile)
        this.#allEvents = this.getEventsForTracks(this.#getArrayOfNumbers(midiFile.tracks.length))
        this.#thirdEvents = []
    }

    #getArrayOfNumbers = (length: number) => Array.apply(null, Array(length)).map((x, i) => i)

    #getInitialEvents = (midiFile: IMidiFile) => this.parseMidiJson(midiFile)

    getEventsBySectionIndex = (sectionsOfEvents: SectionOfEvents[], index: number) => {
        const section = this.#findSectionByKey(index.toString(), sectionsOfEvents)

        if (section) {
            const events = this.#getEventsFromSection(section)

            return events.map((visualizerEvent) => {
                const computedY = visualizerEvent.y - index * this.#height
                return {
                    ...visualizerEvent,
                    y: computedY,
                }
            })
        } else {
            return []
        }
    }

    getIndexSectionByTime = (time: number) => Math.floor(time / this.#msPerSection)

    #findSectionIndexByKey = (key: string, sections: SectionOfEvents[]) =>
        sections.findIndex((section) => key in section)

    #findSectionByKey = (key: string, sections: SectionOfEvents[]) =>
        sections.find((section) => key in section)

    #getEventsFromSection = (section: SectionOfEvents): VisualizerEvent[] =>
        Object.values(section)[0]

    #getSectionKey = (section: SectionOfEvents) => Object.keys(section)[0]

    getEventsForTracks = (activeTracks: number[]) => {
        if (
            !activeTracks.length ||
            !this.#initialEvents.length ||
            activeTracks.length > this.#initialEvents.length
        ) {
            return []
        }

        let mergedSections: SectionOfEvents[] = []

        const activeTracksSections = activeTracks.map((track) => this.#initialEvents[track]).flat(1)

        activeTracksSections.forEach((section) => {
            const sectionKey = Object.keys(section)[0]
            const existingSectionIndex = this.#findSectionIndexByKey(sectionKey, mergedSections)
            const currentEvents = this.#getEventsFromSection(section)
            let thirdEvents: VisualizerEvent[] = []
            if (this.#thirdEvents) {
                const thirdEventsSection = this.#findSectionByKey(sectionKey, this.#thirdEvents)
                if (thirdEventsSection) {
                    thirdEvents = this.#getEventsFromSection(thirdEventsSection)
                }
            }
            if (existingSectionIndex >= 0) {
                const existingSection = mergedSections[existingSectionIndex]
                const previousEvents = this.#getEventsFromSection(existingSection)
                mergedSections[existingSectionIndex] = {
                    [sectionKey]: [...previousEvents, ...currentEvents, ...thirdEvents],
                }
            } else {
                mergedSections.push({
                    [sectionKey]: [...currentEvents, ...thirdEvents],
                })
            }
        })

        return mergedSections
    }

    setEventsForTracks = (activeTracks: number[]) => {
        this.#allEvents = this.getEventsForTracks(activeTracks)
    }

    #addThirdEvent = (event: VisualizerEvent) => {
        const { startingTime } = event
        const indexSection = this.getIndexSectionByTime(startingTime).toString()
        const indexExistingSection = this.#findSectionIndexByKey(indexSection, this.#thirdEvents)
        const sectionAlreadyExists = indexExistingSection >= 0

        if (sectionAlreadyExists) {
            const events = this.#getEventsFromSection(this.#thirdEvents[indexExistingSection])
            this.#thirdEvents[indexExistingSection] = {
                [indexSection]: [...events, event],
            }
        } else {
            const section = {
                [indexSection]: [event],
            }

            this.#thirdEvents.push(section)
        }
    }

    clearThirdEvents = () => {
        this.#thirdEvents = []
    }

    getNoteEvents = (): SectionOfEvents[] =>
        this.#allEvents.map((section) => {
            const key = this.#getSectionKey(section)
            const events = this.#getEventsFromSection(section).filter((event) => isNoteEvent(event))

            return {
                [key]: [...events],
            }
        })

    getAllEvents = (): SectionOfEvents[] => this.#allEvents

    addLoopTimeStampEvent = (time: number) => {
        const event = this.getLoopTimestampEvent(time)
        this.#addThirdEvent(event)
    }
}
