import { isNoteEvent, VisualizerEvent, VisualizerNoteEvent } from '../types'
import { SectionOfEvents } from '../types'
import { MidiVisualizerActiveNote } from '../../../types'
import minBy from 'lodash/minBy'
import { SectionFactory } from './SectionFactory'

export class VisualizerEventManager extends SectionFactory {
    #msPerSection: number

    constructor(msPerSection: number, height: number) {
        super(msPerSection, height)
        this.#msPerSection = msPerSection
    }

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

    getActiveNotes = (
        sectionsOfEvents: SectionOfEvents[],
        time: number
    ): MidiVisualizerActiveNote[] => {
        const indexSectionPlaying = this.getIndexSectionByTime(time).toString()
        const sectionPlaying = this.findSectionByKey(indexSectionPlaying, sectionsOfEvents)
        const isEventActive = (event: VisualizerEvent) =>
            event.startingTime <= time && event.startingTime + event.duration > time
        const isActiveNote = (event: VisualizerEvent) => isNoteEvent(event) && isEventActive(event)

        if (sectionPlaying) {
            const sectionEvents = this.getEventsFromSection(sectionPlaying)
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
            const section = this.findSectionByKey(key, sectionsOfEvents)
            if (section) {
                const sectionEvents: VisualizerEvent[] = this.getEventsFromSection(section)
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
}
