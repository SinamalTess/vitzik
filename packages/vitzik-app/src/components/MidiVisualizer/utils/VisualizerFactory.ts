import { MidiVisualizerActiveNote, MsPerBeat } from '../../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { isEven } from '../../../utils'
import minBy from 'lodash/minBy'
import { VisualizerNoteEvent } from '../types'
import { VisualizerFileParserFactory } from './VisualizerFileParserFactory'
import { SectionNoteEvents } from '../types'
import { Dimensions } from '../types/Dimensions'

export class VisualizerFactory extends VisualizerFileParserFactory {
    width: number
    height: number
    msPerSection: number
    allMsPerBeat: MsPerBeat[]
    ticksPerBeat: number

    constructor(
        containerDimensions: Dimensions,
        msPerSection: number,
        midiMetas: {
            allMsPerBeat: MsPerBeat[]
            ticksPerBeat: number
        }
    ) {
        super(containerDimensions, msPerSection, midiMetas)

        this.width = containerDimensions.width
        this.height = containerDimensions.height
        this.msPerSection = msPerSection
        this.allMsPerBeat = midiMetas.allMsPerBeat
        this.ticksPerBeat = midiMetas.ticksPerBeat
    }

    visualizerNoteEventToActiveNote = (
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

    visualizerNoteEventsToActiveNotes = (visualizerNoteEvents: VisualizerNoteEvent[]) =>
        visualizerNoteEvents.map((visualizerNoteEvent) =>
            this.visualizerNoteEventToActiveNote(visualizerNoteEvent)
        )

    getIndexSectionPlaying = (time: number) => Math.floor(time / this.msPerSection)

    getSlidesPercentageTop = (time: number) => {
        const exactNbSectionPassed = time / this.msPerSection
        const percentageTop = +((exactNbSectionPassed % 1) * 100)
        const percentageTop1 = `${100 - percentageTop}%`
        const percentageTop2 = `-${percentageTop}%`
        const indexSectionPlaying = this.getIndexSectionPlaying(time)
        const isIndexSectionPlayingEven = isEven(indexSectionPlaying)

        return isIndexSectionPlayingEven
            ? [percentageTop2, percentageTop1]
            : [percentageTop1, percentageTop2]
    }

    getIndexesSectionToDraw = (time: number) => {
        const indexSectionPlaying = this.getIndexSectionPlaying(time)
        const nextSectionIndex = indexSectionPlaying + 1
        const isIndexSectionEven = isEven(indexSectionPlaying)

        if (time === 0) {
            const slideToRedraw = isIndexSectionEven ? 'slide1' : 'slide0'
            return {
                slide0: indexSectionPlaying,
                slide1: indexSectionPlaying,
                [slideToRedraw]: nextSectionIndex,
            }
        } else {
            return {
                slide0: isIndexSectionEven ? indexSectionPlaying : nextSectionIndex,
                slide1: isIndexSectionEven ? nextSectionIndex : indexSectionPlaying,
            }
        }
    }

    getNoteEventsBySectionIndex = (
        sectionsOfNoteEvents: SectionNoteEvents[] | undefined,
        index: number
    ): VisualizerNoteEvent[] => {
        if (!sectionsOfNoteEvents) return []
        const section = sectionsOfNoteEvents.find((section) => index.toString() in section)
        const visualizerNoteEvents: VisualizerNoteEvent[] = section ? Object.values(section)[0] : []

        return visualizerNoteEvents.map((visualizerNoteEvent) => {
            const y = visualizerNoteEvent.y - index * this.height
            return {
                ...visualizerNoteEvent,
                y,
            }
        })
    }

    getActiveNotes = (
        sectionsOfNoteEvents: SectionNoteEvents[],
        time: number
    ): MidiVisualizerActiveNote[] => {
        const indexSectionPlaying = this.getIndexSectionPlaying(time)
        const sectionPlaying = sectionsOfNoteEvents.find(
            (section) => indexSectionPlaying.toString() in section
        )

        if (sectionPlaying) {
            const sectionMidiVisualizerNoteEvents = Object.values(sectionPlaying)[0]
            const activeMidiVisualizerNoteEvents = sectionMidiVisualizerNoteEvents.filter(
                ({ startingTime, duration }: VisualizerNoteEvent) =>
                    startingTime <= time && startingTime + duration > time
            )

            return this.visualizerNoteEventsToActiveNotes(activeMidiVisualizerNoteEvents)
        }

        return []
    }

    getTimeToNextNote = (sectionsOfNoteEvents: SectionNoteEvents[], time: number) => {
        if (!sectionsOfNoteEvents.length) return null

        const MAX_NB_SECTIONS_TO_CHECK = 5 // for better performance we limit the search to only a few sections ahead

        const indexSectionPlaying = this.getIndexSectionPlaying(time)
        const nbSectionsLeft = sectionsOfNoteEvents.length - indexSectionPlaying
        const nbSectionsToCheck = Math.max(nbSectionsLeft, MAX_NB_SECTIONS_TO_CHECK)

        for (let i = indexSectionPlaying; i < nbSectionsToCheck; i++) {
            const key = i.toString()
            const section = sectionsOfNoteEvents.find((section) => key in section)
            if (section) {
                const sectionNotes: VisualizerNoteEvent[] = Object.values(section)[0]
                const nextNotes = sectionNotes.filter(({ startingTime }) => startingTime > time)
                const firstNextNote = minBy(nextNotes, 'startingTime')
                if (firstNextNote) {
                    return firstNextNote.startingTime
                }
            }
        }

        return null
    }

    static getActiveTracksNoteEvents = (
        activeTracks: number[],
        sectionsOfNoteEvents: SectionNoteEvents[][]
    ): SectionNoteEvents[] => {
        if (
            !activeTracks.length ||
            !sectionsOfNoteEvents.length ||
            activeTracks.length > sectionsOfNoteEvents.length
        ) {
            return []
        }

        let mergedSections: SectionNoteEvents[] = []

        const activeTracksSections = activeTracks
            .map((track) => sectionsOfNoteEvents[track])
            .flat(1)

        activeTracksSections.forEach((section) => {
            const sectionKey = Object.keys(section)[0]
            const existingSectionIndex = mergedSections.findIndex(
                (section) => sectionKey.toString() in section
            )
            if (existingSectionIndex >= 0) {
                const previousValues = Object.values(mergedSections[existingSectionIndex])[0]
                const currentValues = Object.values(section)[0]
                mergedSections[existingSectionIndex] = {
                    [sectionKey]: [...previousValues, ...currentValues],
                }
            } else {
                mergedSections.push(section)
            }
        })

        return mergedSections
    }

    getVisualizerNoteEvents = (midiFile: IMidiFile) => this.parseMidiJson(midiFile)
}
