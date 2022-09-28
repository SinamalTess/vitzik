import { isEven } from '../../../utils'
import { Section } from './Section'

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

    findSectionByKey = (key: string, sections: Section[]) =>
        sections.find((section) => section.index === key)

    getIndexSectionByTime = (time: number) => Math.floor(time / this.#msPerSection)

    getEventsBySectionIndex = (sectionsOfEvents: Section[], index: number) => {
        const section = this.findSectionByKey(index.toString(), sectionsOfEvents)

        if (section) {
            const { events } = section

            return events.map((visualizerEvent) => {
                const computedY =
                    this.#height + index * this.#height - (visualizerEvent.y + visualizerEvent.h)
                return {
                    ...visualizerEvent,
                    y: computedY,
                }
            })
        } else {
            return []
        }
    }
}
