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
    #events: SectionOfEvents[][]

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
        this.#events = this.#getInitialEvents(midiFile)
    }

    #getInitialEvents = (midiFile: IMidiFile) => this.parseMidiJson(midiFile)

    #visualizerNoteEventToActiveNote = (
        visualizerNoteEvent: VisualizerNoteEvent
    ): MidiVisualizerActiveNote => {
        return {
            startingTime: visualizerNoteEvent.startingTime,
            duration: visualizerNoteEvent.duration,
            key: visualizerNoteEvent.key,
            channel: visualizerNoteEvent.channel,
            name: visualizerNoteEvent.name,
            velocity: visualizerNoteEvent.velocity,
            uniqueId: visualizerNoteEvent.uniqueId,
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

    #getNbTracks = () => this.#events.length

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

    getEventsBySectionIndex = (sectionsOfEvents: SectionOfEvents[] | undefined, index: number) => {
        if (!sectionsOfEvents) return []
        const section = this.#findSectionByKey(index.toString(), sectionsOfEvents)
        if (section) {
            const events = this.#getEventsFromSection(section)

            return events.map((visualizerEvent) => {
                const y = visualizerEvent.y - index * this.#height
                return {
                    ...visualizerEvent,
                    y,
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

        if (sectionPlaying) {
            const sectionEvents = this.#getEventsFromSection(sectionPlaying)
            const activeNoteEvents = sectionEvents.filter(
                (event) =>
                    isNoteEvent(event) &&
                    event.startingTime <= time &&
                    event.startingTime + event.duration > time
            )

            return this.#visualizerNoteEventsToActiveNotes(
                activeNoteEvents as VisualizerNoteEvent[]
            )
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

    getEventsForTracks = (activeTracks: number[]): SectionOfEvents[] => {
        if (
            !activeTracks.length ||
            !this.#events.length ||
            activeTracks.length > this.#events.length
        ) {
            return []
        }

        let mergedSections: SectionOfEvents[] = []

        const activeTracksSections = activeTracks.map((track) => this.#events[track]).flat(1)

        activeTracksSections.forEach((section) => {
            const sectionKey = Object.keys(section)[0]
            const existingSectionIndex = this.#findSectionIndexByKey(sectionKey, mergedSections)
            if (existingSectionIndex >= 0) {
                const existingSection = mergedSections[existingSectionIndex]
                const previousEvents = this.#getEventsFromSection(existingSection)
                const currentEvents = this.#getEventsFromSection(section)
                mergedSections[existingSectionIndex] = {
                    [sectionKey]: [...previousEvents, ...currentEvents],
                }
            } else {
                mergedSections.push(section)
            }
        })

        return mergedSections
    }

    #addEventToTrack = (event: VisualizerEvent, track: number) => {
        const newEvents = [...this.#events]
        const newEventsTrack = [...newEvents[track]]
        const indexSection = this.getIndexSectionByTime(event.startingTime).toString()
        const sectionIndex = this.#findSectionIndexByKey(indexSection, newEventsTrack)
        if (sectionIndex >= 0) {
            const section = newEventsTrack[sectionIndex]
            const events = this.#getEventsFromSection(section)
            newEventsTrack[sectionIndex] = <SectionOfEvents>{
                [sectionIndex]: [...events, event],
            }
        }
        this.#events[track] = newEventsTrack
    }

    clearLoopTimeStampEvents = () => {
        this.#events[0] = this.#events[0].map((section) => {
            const key = this.#getSectionKey(section)
            const events = this.#getEventsFromSection(section).filter((event) => isNoteEvent(event))
            return {
                [key]: [...events],
            }
        })
    }

    addLoopTimeStampEvent = (time: number) => {
        const event = this.getLoopTimestampEvent(time)
        this.#addEventToTrack(event, 0)
    }
}
