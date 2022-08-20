import { MidiVisualizerActiveNote, MsPerBeat } from '../../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { isEven } from '../../../utils'
import minBy from 'lodash/minBy'
import { MidiVisualizerNoteEvent } from './MidiVisualizerEvents'
import { MidiVisualizerFileParserFactory } from './MidiVisualizerFileParserFactory'

export interface SectionNoteCoordinates {
    [sectionIndex: number]: MidiVisualizerNoteEvent[]
}

export class MidiVisualizerFactory extends MidiVisualizerFileParserFactory {
    width: number
    height: number
    msPerSection: number
    allMsPerBeat: MsPerBeat[]
    ticksPerBeat: number

    constructor(
        containerDimensions: {
            height: number
            width: number
        },
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

    noteCoordinatesToActiveNotes = (
        noteCoordinates: MidiVisualizerNoteEvent[]
    ): MidiVisualizerActiveNote[] =>
        noteCoordinates.map(
            ({ startingTime, uniqueId, name, velocity, duration, key, channel }) => ({
                name,
                velocity,
                duration,
                key,
                channel,
                startingTime,
                uniqueId,
            })
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
                [slideToRedraw]: nextSectionIndex
            }
        } else {
            return {
                slide0: isIndexSectionEven ? indexSectionPlaying : nextSectionIndex,
                slide1: isIndexSectionEven ? nextSectionIndex : indexSectionPlaying,
            }
        }
    }

    static getSectionCoordinates = (
        notesCoordinates: SectionNoteCoordinates[] | undefined,
        indexToDraw: number,
        height: number
    ): MidiVisualizerNoteEvent[] => {
        if (!notesCoordinates) return []
        const section = notesCoordinates.find((section) => indexToDraw.toString() in section)
        const coordinates: MidiVisualizerNoteEvent[] = section ? Object.values(section)[0] : []
        return coordinates.map((coordinate) => {
            return {
                ...coordinate,
                y: coordinate.y - indexToDraw * height,
            }
        })
    }

    getActiveNotes = (
        notesCoordinates: SectionNoteCoordinates[],
        time: number
    ): MidiVisualizerActiveNote[] => {
        const sectionPlaying = this.getIndexSectionPlaying(time)
        const section = notesCoordinates.find((section) => sectionPlaying.toString() in section)
        if (section) {
            const sectionNotes = Object.values(section)[0]
            const activeNotesCoordinates = sectionNotes.filter(
                ({ startingTime, duration }: MidiVisualizerNoteEvent) =>
                    startingTime <= time && startingTime + duration > time
            )

            return this.noteCoordinatesToActiveNotes(activeNotesCoordinates)
        }

        return []
    }

    getTimeToNextNote = (notesCoordinates: SectionNoteCoordinates[], time: number) => {
        if (!notesCoordinates.length) return null

        const indexSectionPlaying = this.getIndexSectionPlaying(time)
        const nbSectionsLeft = notesCoordinates.length - indexSectionPlaying
        const maxNbSectionsToCheck = Math.max(nbSectionsLeft, 5) // to have better performance we limit the search to only a few sections ahead

        for (let i = indexSectionPlaying; i < maxNbSectionsToCheck; i++) {
            const key = i.toString()
            const section = notesCoordinates.find((section) => key in section)
            if (section) {
                const sectionNotes: MidiVisualizerNoteEvent[] = Object.values(section)[0]
                const nextNotes = sectionNotes.filter(({ startingTime }) => startingTime > time)
                const firstNextNote = minBy(nextNotes, 'startingTime')
                if (firstNextNote) {
                    return firstNextNote.startingTime
                }
            }
        }

        return null
    }

    static mergeNotesCoordinates = (
        activeTracks: number[],
        noteCoordinates: SectionNoteCoordinates[][]
    ): SectionNoteCoordinates[] => {
        if (
            !activeTracks.length ||
            !noteCoordinates.length ||
            activeTracks.length > noteCoordinates.length
        ) {
            return []
        }

        let mergedCoordinates: SectionNoteCoordinates[] = []

        const coordinatesActiveTracks = activeTracks.map((track) => noteCoordinates[track]).flat(1)

        coordinatesActiveTracks.forEach((section) => {
            const sectionKey = Object.keys(section)[0]
            const existingSectionIndex = mergedCoordinates.findIndex(
                (section) => sectionKey.toString() in section
            )
            if (existingSectionIndex >= 0) {
                const previousValues = Object.values(mergedCoordinates[existingSectionIndex])[0]
                const currentValues = Object.values(section)[0]
                mergedCoordinates[existingSectionIndex] = {
                    [sectionKey]: [...previousValues, ...currentValues],
                }
            } else {
                mergedCoordinates.push(section)
            }
        })

        return mergedCoordinates
    }

    getNotesCoordinates = (midiFile: IMidiFile) => this.parseMidiJson(midiFile)
}
