import { SectionOfEvents, VisualizerEvent } from '../types'
import { isEven } from '../../../utils'

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

    findSectionByKey = (key: string, sections: SectionOfEvents[]) =>
        sections.find((section) => key in section)

    getIndexSectionByTime = (time: number) => Math.floor(time / this.#msPerSection)

    getEventsFromSection = (section: SectionOfEvents): VisualizerEvent[] =>
        Object.values(section)[0]

    getEventsBySectionIndex = (sectionsOfEvents: SectionOfEvents[], index: number) => {
        const section = this.findSectionByKey(index.toString(), sectionsOfEvents)

        if (section) {
            const events = this.getEventsFromSection(section)

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
}
