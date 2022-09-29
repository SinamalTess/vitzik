import { isEven } from '../../../utils'
import { Section } from '../classes/Section'
import { Coordinates } from '../classes/Coordinates'
import { NoteEvent } from '../classes/NoteEvent'

export class SectionFactory {
    #msPerSection: number
    #height: number

    constructor(msPerSection: number, height: number) {
        this.#msPerSection = msPerSection
        this.#height = height
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

    findSectionByIndex = (index: string, sections: Section[]) =>
        sections.find((section) => section.index === index)

    getIndexSectionByTime = (time: number) => Math.floor(time / this.#msPerSection)

    getEventsBySectionIndex = (sectionsOfEvents: Section[], index: number) => {
        const section = this.findSectionByIndex(index.toString(), sectionsOfEvents)

        if (section) {
            const { events } = section

            return events.map((visualizerEvent) => {
                const { x, y, w, h } = visualizerEvent.coordinates
                const computedY = this.#height + index * this.#height - (y + h)
                const coordinates = new Coordinates(x, computedY, w, h)

                // @ts-ignore
                return new NoteEvent(coordinates, visualizerEvent.metas, visualizerEvent.note)
            })
        } else {
            return []
        }
    }
}
