import { MsPerBeat } from '../../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { isLoopTimestampEvent, isNoteEvent, VisualizerEvent } from '../types'
import { VisualizerFileParserFactory } from './VisualizerFileParserFactory'
import { SectionOfEvents } from '../types'
import { Dimensions } from '../types/Dimensions'

export class VisualizerFactory extends VisualizerFileParserFactory {
    #height: number
    #msPerSection: number
    #midiFileEvents: SectionOfEvents[][]
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
        this.#midiFileEvents = this.#getMidiFileEvents(midiFile)
        this.#allEvents = this.getEventsForTracks(this.#getArrayOfNumbers(midiFile.tracks.length))
        this.#thirdEvents = []
    }

    #getArrayOfNumbers = (length: number) => Array.apply(null, Array(length)).map((x, i) => i)

    #getMidiFileEvents = (midiFile: IMidiFile) => this.parseMidiJson(midiFile)

    getAllEvents = (): SectionOfEvents[] => this.#allEvents

    getNoteEvents = (): SectionOfEvents[] =>
        this.#allEvents.map((section) => {
            const key = this.#getSectionKey(section)
            const events = this.#getEventsFromSection(section).filter((event) => isNoteEvent(event))

            return {
                [key]: [...events],
            }
        })

    getEventsBySectionIndex = (sections: SectionOfEvents[], index: number) => {
        const section = this.#findSectionByKey(index.toString(), sections)

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

    #findSectionIndexByKey = (key: string, sections: SectionOfEvents[]) =>
        sections.findIndex((section) => key in section)

    #findSectionByKey = (key: string, sections: SectionOfEvents[]) =>
        sections.find((section) => key in section)

    getIndexSectionByTime = (time: number) => Math.floor(time / this.#msPerSection)

    #getEventsFromSection = (section: SectionOfEvents): VisualizerEvent[] =>
        Object.values(section)[0]

    #getSectionKey = (section: SectionOfEvents) => Object.keys(section)[0]

    getEventsForTracks = (activeTracks: number[]) => {
        if (
            !activeTracks.length ||
            !this.#midiFileEvents.length ||
            activeTracks.length > this.#midiFileEvents.length
        ) {
            return []
        }

        let mergedSections: SectionOfEvents[] = []

        const activeTracksSections = activeTracks
            .map((track) => this.#midiFileEvents[track])
            .flat(1)

        activeTracksSections.forEach((section) => {
            const sectionKey = this.#getSectionKey(section)
            const currentEvents = this.#getEventsFromSection(section)
            let thirdEvents: VisualizerEvent[] = []
            let currentEventsCopy: VisualizerEvent[] = []

            if (this.#thirdEvents) {
                const thirdEventsSection = this.#findSectionByKey(sectionKey, this.#thirdEvents)
                if (thirdEventsSection) {
                    thirdEvents = this.#getEventsFromSection(thirdEventsSection)

                    const loopTimestamps = thirdEvents
                        .filter((event) => isLoopTimestampEvent(event))
                        .sort((a, b) => a.startingTime - b.startingTime)

                    currentEvents.forEach((event) => {
                        const isCutByLoopTimestamp = loopTimestamps.find(
                            ({ startingTime }) =>
                                startingTime > event.startingTime &&
                                startingTime < event.startingTime + event.duration
                        )
                        if (isCutByLoopTimestamp) {
                            const newEvents: VisualizerEvent[] = []
                            loopTimestamps.forEach(({ startingTime }) => {
                                const isCuttingEvent =
                                    startingTime > event.startingTime &&
                                    startingTime < event.startingTime + event.duration

                                if (isCuttingEvent) {
                                    const firstHalf = {
                                        ...event,
                                        h: this.getYFromStartingTime(startingTime) - event.y,
                                        duration: startingTime - event.duration,
                                    }
                                    const secondHalf = {
                                        ...event,
                                        startingTime,
                                        y: this.getYFromStartingTime(startingTime),
                                        uniqueId: `${Math.random()}`,
                                        h:
                                            event.h -
                                            (this.getYFromStartingTime(startingTime) - event.y),
                                        duration: startingTime - event.duration,
                                    }
                                    newEvents.push({ ...firstHalf }, { ...secondHalf })
                                }
                            })
                            currentEventsCopy.push(...newEvents)
                        } else {
                            currentEventsCopy.push(event)
                        }
                    })
                } else {
                    currentEventsCopy = [...currentEvents]
                }
            }

            const newEvents = [...currentEventsCopy, ...thirdEvents]

            this.updateOrCreateSection(mergedSections, newEvents, sectionKey)
        })

        return mergedSections
    }

    setEventsForTracks = (activeTracks: number[]) => {
        this.#allEvents = this.getEventsForTracks(activeTracks)
    }

    updateOrCreateSection = (
        sections: SectionOfEvents[],
        newEvents: VisualizerEvent[],
        sectionKey: string
    ) => {
        const indexExistingSection = this.#findSectionIndexByKey(sectionKey, sections)
        const sectionAlreadyExists = indexExistingSection >= 0

        if (sectionAlreadyExists) {
            const events = this.#getEventsFromSection(sections[indexExistingSection])
            sections[indexExistingSection] = {
                [sectionKey]: [...events, ...newEvents],
            }
        } else {
            const section = {
                [sectionKey]: [...newEvents],
            }

            sections.push(section)
        }
    }

    #addThirdEvent = (event: VisualizerEvent) => {
        const { startingTime } = event
        const indexSection = this.getIndexSectionByTime(startingTime).toString()
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
