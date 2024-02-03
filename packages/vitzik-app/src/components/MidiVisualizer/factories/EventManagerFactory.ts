import { VisualizerEvent } from '../types'
import { MidiVisualizerActiveNote } from '@/types'
import minBy from 'lodash/minBy'
import { SectionFactory } from './SectionFactory'
import { Section } from '../classes/Section'
import { NoteEvent } from '../classes/NoteEvent'

export class EventManagerFactory extends SectionFactory {
    #msPerSection: number

    constructor(msPerSection: number, height: number) {
        super(msPerSection, height)
        this.#msPerSection = msPerSection
    }

    #noteEventToActiveNote = (noteEvent: NoteEvent): MidiVisualizerActiveNote => ({
        ...noteEvent.note,
        ...noteEvent.metas,
    })

    #noteEventsToActiveNotes = (noteEvents: NoteEvent[]) =>
        noteEvents.map((noteEvent) => this.#noteEventToActiveNote(noteEvent))

    getActiveNotes = (sections: Section[], time: number): MidiVisualizerActiveNote[] => {
        const indexSectionPlaying = this.getIndexSectionByTime(time).toString()
        const sectionPlaying = this.findSectionByIndex(indexSectionPlaying, sections)
        const isEventActive = (event: VisualizerEvent) =>
            event.startingTime <= time && event.startingTime + event.duration > time
        const isActiveNote = (event: VisualizerEvent) =>
            event instanceof NoteEvent && isEventActive(event)

        if (sectionPlaying) {
            const { events } = sectionPlaying
            const activeNoteEvents = events.filter((event) => isActiveNote(event)) as NoteEvent[]

            return this.#noteEventsToActiveNotes(activeNoteEvents)
        }

        return []
    }

    getNextNoteStartingTime = (sections: Section[], time: number) => {
        if (!sections.length) return null

        const MAX_NB_SECTIONS_TO_CHECK = 5 // for better performance we limit the search to only a few sections ahead

        const indexSectionPlaying = this.getIndexSectionByTime(time)
        const nbSectionsLeft = sections.length - indexSectionPlaying
        const nbSectionsToCheck = Math.min(nbSectionsLeft, MAX_NB_SECTIONS_TO_CHECK)
        const lastSectionToCheck = indexSectionPlaying + nbSectionsToCheck

        for (let i = indexSectionPlaying; i < lastSectionToCheck; i++) {
            const index = i.toString()
            const section = this.findSectionByIndex(index, sections)
            if (section) {
                const { events } = section
                const nextNotes = events.filter(
                    (event) => event instanceof NoteEvent && event.startingTime > time
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
