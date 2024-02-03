import { isEven } from '@/utils'
import { SectionFactory } from './SectionFactory'

export class AnimationFactory extends SectionFactory {
    #height: number
    #msPerSection: number

    constructor(height: number, msPerSection: number) {
        super(msPerSection, height)
        this.#height = height
        this.#msPerSection = msPerSection
    }

    getSlidesPercentageTop = (time: number) => {
        const exactNbSectionPassed = time / this.#msPerSection
        const percentageTop = +((exactNbSectionPassed % 1) * 100)
        const percentageTop1 = `-${100 - percentageTop}%`
        const percentageTop2 = `${percentageTop}%`
        const indexSectionPlaying = this.getIndexSectionByTime(time)
        const isIndexSectionPlayingEven = isEven(indexSectionPlaying)

        return isIndexSectionPlayingEven
            ? [percentageTop2, percentageTop1]
            : [percentageTop1, percentageTop2]
    }
}
