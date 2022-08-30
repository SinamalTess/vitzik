import { MidiVisualizerActiveNote, MsPerBeat } from '../../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { isEven } from '../../../utils'
import minBy from 'lodash/minBy'
import { isNoteEvent, VisualizerEvent, VisualizerNoteEvent } from '../types'
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

    #visualizerNoteEventToActiveNote = (
        visualizerNoteEvent: VisualizerNoteEvent
    ): MidiVisualizerActiveNote => {
        const { startingTime, duration, key, channel, name, velocity, uniqueId } =
            visualizerNoteEvent
        return {
            startingTime,
            duration,
            key,
            channel,
            name,
            velocity,
            uniqueId,
        }
    }

    #visualizerNoteEventsToActiveNotes = (visualizerNoteEvents: VisualizerNoteEvent[]) =>
        visualizerNoteEvents.map((visualizerNoteEvent) =>
            this.#visualizerNoteEventToActiveNote(visualizerNoteEvent)
        )

    getIndexSectionByTime = (time: number) => Math.floor(time / this.#msPerSection)

    #findSectionIndexByKey = (key: string, sections: SectionOfEvents[]) =>
        sections.findIndex((section) => key in section)

    #findSectionByKey = (key: string, sections: SectionOfEvents[]) =>
        sections.find((section) => key in section)

    #getEventsFromSection = (section: SectionOfEvents): VisualizerEvent[] =>
        Object.values(section)[0]

    #getSectionKey = (section: SectionOfEvents) => Object.keys(section)[0]

    getSlidesPercentageTop = (time: number) => {
        const exactNbSectionPassed = time / this.#msPerSection
        const percentageTop = +((exactNbSectionPassed % 1) * 100)
        const percentageTop1 = `${100 - percentageTop}%`
        const percentageTop2 = `-${percentageTop}%`
        const indexSectionPlaying = this.getIndexSectionByTime(time)
        const isIndexSectionPlayingEven = isEven(indexSectionPlaying)

        return isIndexSectionPlayingEven
            ? [percentageTop2, percentageTop1]
            : [percentageTop1, percentageTop2]
    }

    getIndexesSectionToDraw = (time: number) => {
        const indexSectionPlaying = this.getIndexSectionByTime(time)
        const nextSectionIndex = indexSectionPlaying + 1
        const isIndexSectionEven = isEven(indexSectionPlaying)

        return [
            isIndexSectionEven ? indexSectionPlaying : nextSectionIndex,
            isIndexSectionEven ? nextSectionIndex : indexSectionPlaying,
        ]
    }

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

    getActiveNotes = (
        sectionsOfEvents: SectionOfEvents[],
        time: number
    ): MidiVisualizerActiveNote[] => {
        const indexSectionPlaying = this.getIndexSectionByTime(time).toString()
        const sectionPlaying = this.#findSectionByKey(indexSectionPlaying, sectionsOfEvents)
        const isActiveNote = (event: VisualizerEvent) =>
            isNoteEvent(event) && this.isEventActive(event, time)

        if (sectionPlaying) {
            const sectionEvents = this.#getEventsFromSection(sectionPlaying)
            const activeNoteEvents = sectionEvents.filter((event) =>
                isActiveNote(event)
            ) as VisualizerNoteEvent[]

            return this.#visualizerNoteEventsToActiveNotes(activeNoteEvents)
        }

        return []
    }

    getNextNoteStartingTime = (sectionsOfEvents: SectionOfEvents[], time: number) => {
        if (!sectionsOfEvents.length) return null

        const MAX_NB_SECTIONS_TO_CHECK = 5 // for better performance we limit the search to only a few sections ahead

        const indexSectionPlaying = this.getIndexSectionByTime(time)
        const nbSectionsLeft = sectionsOfEvents.length - indexSectionPlaying
        const nbSectionsToCheck = Math.min(nbSectionsLeft, MAX_NB_SECTIONS_TO_CHECK)
        const lastSectionToCheck = indexSectionPlaying + nbSectionsToCheck

        for (let i = indexSectionPlaying; i < lastSectionToCheck; i++) {
            const key = i.toString()
            const section = this.#findSectionByKey(key, sectionsOfEvents)
            if (section) {
                const sectionEvents: VisualizerEvent[] = this.#getEventsFromSection(section)
                const nextNotes = sectionEvents.filter(
                    (event) => isNoteEvent(event) && event.startingTime > time
                )
                const firstNextNote = minBy(nextNotes, 'startingTime')
                if (firstNextNote) {
                    return firstNextNote.startingTime
                }
            }
        }

        return null
    }

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
            console.log({ thirdEvents })
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
        console.log({ mergedSections })

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
