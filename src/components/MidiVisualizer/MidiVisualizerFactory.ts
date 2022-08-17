import {
    MidiInputActiveNote,
    MidiMetas,
    MidiVisualizerActiveNote,
    MidiVisualizerNoteCoordinates,
    MsPerBeat,
} from '../../types'
import { MIDI_PIANO_KEYS_OFFSET, NOTE_NAMES } from '../../utils/const'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    getWidthKeys,
    isBlackKey as checkIsBlackKey,
    isEven,
    isNoteOffEvent,
    isNoteOnEvent,
    MidiFactory,
} from '../../utils'
import findLast from 'lodash/findLast'
import minBy from 'lodash/minBy'

interface PartialNote extends MidiVisualizerNoteCoordinates {
    deltaAcc: number
}

export interface SectionNoteCoordinates {
    [sectionIndex: number]: MidiVisualizerNoteCoordinates[]
}

export class MidiVisualizerFactory {
    ratioSection: number
    midiMetas: MidiMetas
    msPerBeat: number
    width: number
    height: number
    msPerSection: number

    constructor(midiMetas: MidiMetas, height: number, width: number, msPerSection: number) {
        this.midiMetas = midiMetas
        this.msPerBeat = MidiFactory.Time().getInitialMsPerBeatValue(midiMetas.allMsPerBeat)
        this.ratioSection = height / msPerSection
        this.width = width
        this.height = height
        this.msPerSection = msPerSection
    }

    static getMsPerBeatFromTime = (allMsPerBeat: MsPerBeat[], time: number) => {
        return (
            findLast(allMsPerBeat, (msPerBeat) => msPerBeat.timestamp <= time) ??
            allMsPerBeat.find((msPerBeat) => msPerBeat.timestamp >= time)
        )
    }

    static getNoteId = (trackIndex: number, note: MidiInputActiveNote) =>
        `${trackIndex}-${note.channel}-${note.name}`

    getNotePartialCoordinates = (note: MidiInputActiveNote, deltaAcc: number) => {
        const { name, key } = note
        const startingTime = this.deltaToTime(deltaAcc)
        const y = this.ratioSection * startingTime

        /*
            Some notes don't have associated names because they are just frequencies.
            See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
            We won't render them visually, but they need to be played.
            Therefore, we pass a 'width' and 'x' of 0 --> to skip rendering
            But the 'y' and 'h' must be correct --> to play at the right timing
        */
        if (name) {
            const isBlackKey = checkIsBlackKey(name)
            const { widthWhiteKey, widthBlackKey } = getWidthKeys(this.width)
            const previousKeys = NOTE_NAMES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
            const nbPreviousWhiteKeys = previousKeys.filter((note) => !checkIsBlackKey(note)).length
            const margin = isBlackKey ? widthBlackKey : widthWhiteKey / 4
            const w = isBlackKey ? widthBlackKey : widthWhiteKey
            const x = nbPreviousWhiteKeys * widthWhiteKey - margin

            return {
                w,
                y,
                h: 0, // is replaced by the actual value after the noteOff event is received
                x,
                deltaAcc,
                startingTime,
            }
        } else {
            return {
                w: 0,
                y,
                h: 0, // is replaced by the actual value after the noteOff event is received
                x: 0,
                deltaAcc,
                startingTime,
            }
        }
    }

    noteCoordinatesToActiveNotes = (
        noteCoordinates: MidiVisualizerNoteCoordinates[]
    ): MidiVisualizerActiveNote[] =>
        noteCoordinates.map(({ startingTime, name, velocity, id, duration, key, channel }) => ({
            name,
            velocity,
            duration,
            id,
            key,
            channel,
            startingTime,
        }))

    getMsPerBeatFromDelta = (delta: number) => {
        return findLast(this.midiMetas.allMsPerBeat, (msPerBeat) => msPerBeat.delta <= delta)
    }

    deltaToTime = (delta: number) => {
        const lastMsPerBeat = this.getMsPerBeatFromDelta(delta)

        if (lastMsPerBeat) {
            const { timestamp, delta: lastDelta, value } = lastMsPerBeat
            return timestamp + ((delta - lastDelta) / this.midiMetas.ticksPerBeat) * value
        }

        return 0
    }

    getIndexSectionPlaying = (time: number) => Math.floor(time / this.msPerSection)

    getPercentageTopSection = (time: number) => {
        const exactNbSectionPassed = time / this.msPerSection
        const percentageTop = +((exactNbSectionPassed % 1) * 100).toFixed(2)
        const percentage1 = `${100 - percentageTop}%`
        const percentage2 = `-${percentageTop}%`
        const indexSectionPlaying = this.getIndexSectionPlaying(time)
        const isIndexEven = isEven(indexSectionPlaying)

        return {
            0: isIndexEven ? percentage2 : percentage1,
            1: isIndexEven ? percentage1 : percentage2,
        }
    }

    getIndexToDraw = (time: number) => {
        const indexSectionPlaying = this.getIndexSectionPlaying(time)
        const isIndexEven = isEven(indexSectionPlaying)
        if (indexSectionPlaying === 0) {
            return {
                0: 0,
                1: 1,
            }
        } else {
            if (time === 0) {
                const sectionToRedraw: number = isIndexEven ? 1 : 0
                return {
                    0: indexSectionPlaying,
                    1: indexSectionPlaying,
                    [sectionToRedraw]: indexSectionPlaying + 1,
                }
            } else {
                return {
                    0: isIndexEven ? indexSectionPlaying : indexSectionPlaying + 1,
                    1: isIndexEven ? indexSectionPlaying + 1 : indexSectionPlaying,
                }
            }
        }
    }

    static getSectionCoordinates = (
        notesCoordinates: SectionNoteCoordinates[] | undefined,
        indexToDraw: number,
        height: number
    ): MidiVisualizerNoteCoordinates[] => {
        if (!notesCoordinates) return []
        const section = notesCoordinates.find((section) => indexToDraw.toString() in section)
        const coordinates: MidiVisualizerNoteCoordinates[] = section
            ? Object.values(section)[0]
            : []
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
                ({ startingTime, duration }: MidiVisualizerNoteCoordinates) =>
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
                const sectionNotes: MidiVisualizerNoteCoordinates[] = Object.values(section)[0]
                const nextNotes = sectionNotes.filter(({ startingTime }) => startingTime > time)
                const firstNextNote = minBy(nextNotes, 'startingTime')
                if (firstNextNote) {
                    return firstNextNote.startingTime
                }
            }
        }

        return null
    }

    addNoteToSection = (
        note: MidiVisualizerNoteCoordinates,
        notesCoordinatesInTrack: SectionNoteCoordinates[]
    ) => {
        const startingSection = Math.floor(note.startingTime / this.msPerSection) // arrays start at 0, so we use floor to get number below
        const endingSection = Math.floor((note.startingTime + note.duration) / this.msPerSection)

        for (let i = startingSection; i <= endingSection; i++) {
            const indexSection = notesCoordinatesInTrack.findIndex((section) => section[i])
            if (indexSection >= 0) {
                notesCoordinatesInTrack[indexSection] = {
                    [i]: [...notesCoordinatesInTrack[indexSection][i], note],
                }
            } else {
                notesCoordinatesInTrack.push({ [i]: [note] })
            }
        }
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

    getNotesCoordinates = (midiFile: IMidiFile) => {
        const { tracks } = midiFile

        let notesCoordinates: SectionNoteCoordinates[][] = []

        tracks.forEach((track) => {
            let deltaAcc = 0
            let notesBeingProcessed: PartialNote[] = []
            let notesCoordinatesInTrack: {
                [sectionIndex: number]: MidiVisualizerNoteCoordinates[]
            }[] = []

            track.forEach((event, index) => {
                deltaAcc = deltaAcc + event.delta

                const lastMsPerBeat = this.getMsPerBeatFromDelta(deltaAcc)

                if (lastMsPerBeat && lastMsPerBeat.value !== this.msPerBeat) {
                    this.msPerBeat = lastMsPerBeat.value
                }

                if (isNoteOnEvent(event)) {
                    const midiNote = MidiFactory.Note(event).getMetas()
                    const notePartialCoordinates = this.getNotePartialCoordinates(
                        midiNote,
                        deltaAcc
                    )

                    notesBeingProcessed.push({
                        ...notePartialCoordinates,
                        ...midiNote,
                        duration: 0, // is replaced by the actual value after the noteOff event is received
                        id: MidiVisualizerFactory.getNoteId(index, midiNote),
                    })
                } else if (
                    isNoteOffEvent(event) ||
                    (isNoteOnEvent(event) && event.noteOn.velocity === 0)
                ) {
                    const key = MidiFactory.Note(event).getKey()
                    const correspondingNoteOnIndex = notesBeingProcessed.findIndex(
                        (note) => note.key === key
                    )
                    if (correspondingNoteOnIndex !== -1) {
                        const note = { ...notesBeingProcessed[correspondingNoteOnIndex] }
                        note.duration = this.deltaToTime(deltaAcc) - note.startingTime
                        note.h = this.ratioSection * note.duration
                        this.addNoteToSection(note, notesCoordinatesInTrack)
                        notesBeingProcessed.splice(correspondingNoteOnIndex, 1)
                    }
                }
            })

            notesCoordinates.push(notesCoordinatesInTrack)
        })

        return notesCoordinates
    }
}
