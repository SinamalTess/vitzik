import {
    AudioPlayerState,
    MidiInputActiveNote,
    MidiMetas,
    MidiVisualizerActiveNote,
    MidiVisualizerNoteCoordinates,
    MsPerBeat,
} from '../../types'
import { MIDI_PIANO_KEYS_OFFSET, NOTE_NAMES } from '../../utils/const'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    getInitialMsPerBeat,
    getKey,
    getNoteMetas,
    getWidthKeys,
    isBlackKey as checkIsBlackKey,
    isEven,
    isNoteOffEvent,
    isNoteOnEvent,
} from '../../utils'

interface PartialNote extends MidiVisualizerNoteCoordinates {
    deltaAcc: number
}

interface IndexToDraw {
    firstSection: number
    secondSection: number
}

type SectionName = keyof IndexToDraw

export class MidiTimeInfos {
    msPerBeat: number
    midiDuration: number
    ticksPerBeat: number
    midiMetas: MidiMetas

    constructor(midiMetas: MidiMetas) {
        this.midiMetas = midiMetas
        this.msPerBeat = getInitialMsPerBeat(this.midiMetas.allMsPerBeat)
        this.midiDuration = this.midiMetas.midiDuration
        this.ticksPerBeat = this.midiMetas.ticksPerBeat
    }

    static getMsPerBeatFromTime(allMsPerBeat: MsPerBeat[], midiCurrentTime: number) {
        const passedMsPerBeat = allMsPerBeat.filter(
            (msPerBeat) => msPerBeat.timestamp <= midiCurrentTime
        )

        return passedMsPerBeat[passedMsPerBeat.length - 1]
    }

    getMsPerBeatFromDelta(delta: number) {
        const passedMsPerBeat = this.midiMetas.allMsPerBeat.filter(
            (msPerBeat) => msPerBeat.delta <= delta
        )

        return passedMsPerBeat[passedMsPerBeat.length - 1]
    }

    deltaToTime(delta: number) {
        const lastMsPerBeat = this.getMsPerBeatFromDelta(delta)

        return (
            lastMsPerBeat.timestamp +
            ((delta - lastMsPerBeat.delta) / this.ticksPerBeat) * lastMsPerBeat.value
        )
    }
}

export interface SectionNoteCoordinates {
    [sectionIndex: number]: MidiVisualizerNoteCoordinates[]
}

class MidiVisualizerPositions extends MidiTimeInfos {
    heightPerBeat: number
    msPerSection: number
    ratioSection: number
    containerDimensions: { h: number; w: number }

    constructor(midiMetas: MidiMetas, containerDimensions: { h: number; w: number }) {
        super(midiMetas)

        this.msPerSection = 500 * 4
        this.ratioSection = containerDimensions.h / this.msPerSection
        this.heightPerBeat = this.msPerBeat * this.ratioSection
        this.containerDimensions = containerDimensions
    }

    getSectionNames = (): SectionName[] => ['firstSection', 'secondSection']

    getIndexSectionPlaying = (midiCurrentTime: number) =>
        Math.floor(midiCurrentTime / this.msPerSection)

    getPercentageTopSection(sectionName: SectionName, midiCurrentTime: number) {
        const exactNbSectionPassed = midiCurrentTime / this.msPerSection
        const percentageTop = +((exactNbSectionPassed % 1) * 100).toFixed(2)
        const percentageFirstSection = `${100 - percentageTop}%`
        const percentageSecondSection = `-${percentageTop}%`
        const sectionPlaying = this.getIndexSectionPlaying(midiCurrentTime)
        const isIndexEven = isEven(sectionPlaying)

        if (sectionName === 'firstSection') {
            return isIndexEven ? percentageSecondSection : percentageFirstSection
        } else {
            return isIndexEven ? percentageFirstSection : percentageSecondSection
        }
    }

    getIndexToDraw(midiCurrentTime: number, audioPlayerState: AudioPlayerState) {
        const indexSectionPlaying = this.getIndexSectionPlaying(midiCurrentTime)
        const isIndexEven = isEven(indexSectionPlaying)
        if (indexSectionPlaying === 0) {
            return {
                firstSection: 0,
                secondSection: 1,
            }
        } else {
            if (audioPlayerState === 'playing') {
                const sectionToRedraw: SectionName = isIndexEven ? 'secondSection' : 'firstSection'
                return {
                    firstSection: indexSectionPlaying,
                    secondSection: indexSectionPlaying,
                    [sectionToRedraw]: indexSectionPlaying + 1,
                }
            } else {
                return {
                    firstSection: isIndexEven ? indexSectionPlaying : indexSectionPlaying + 1,
                    secondSection: isIndexEven ? indexSectionPlaying + 1 : indexSectionPlaying,
                }
            }
        }
    }
}

export class MidiVisualizerCoordinates extends MidiVisualizerPositions {
    constructor(midiMetas: MidiMetas, containerDimensions: { h: number; w: number }) {
        super(midiMetas, containerDimensions)
    }

    static getNoteId = (trackIndex: number, note: MidiInputActiveNote) =>
        `${trackIndex}-${note.channel}-${note.name}`

    static mergeNotesCoordinates(
        activeTracks: number[],
        noteCoordinates: SectionNoteCoordinates[][]
    ): SectionNoteCoordinates[] {
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
            const existingSectionIndex = mergedCoordinates.findIndex((el) =>
                el.hasOwnProperty(sectionKey)
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

    static noteCoordinatesToActiveNotes = (
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

    getNotePartialCoordinates(note: MidiInputActiveNote, deltaAcc: number) {
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
            const { widthWhiteKey, widthBlackKey } = getWidthKeys(this.containerDimensions.w)
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

    addNoteToSection(
        note: MidiVisualizerNoteCoordinates,
        notesCoordinatesInTrack: {
            [sectionIndex: number]: MidiVisualizerNoteCoordinates[]
        }[]
    ) {
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

    getNotesCoordinates(midiFile: IMidiFile) {
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

                if (lastMsPerBeat.value !== this.msPerBeat) {
                    this.msPerBeat = lastMsPerBeat.value
                }

                if (isNoteOnEvent(event)) {
                    const midiNote = getNoteMetas(event)
                    const notePartialCoordinates = this.getNotePartialCoordinates(
                        midiNote,
                        deltaAcc
                    )

                    notesBeingProcessed.push({
                        ...notePartialCoordinates,
                        ...midiNote,
                        duration: 0, // is replaced by the actual value after the noteOff event is received
                        id: MidiVisualizerCoordinates.getNoteId(index, midiNote),
                    })
                } else if (
                    isNoteOffEvent(event) ||
                    (isNoteOnEvent(event) && event.noteOn.velocity === 0)
                ) {
                    const key = getKey(event)
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

    getTimeToNextNote(
        notesCoordinates: SectionNoteCoordinates[],
        sectionPlaying: number,
        midiCurrentTime: number
    ) {
        if (!notesCoordinates.length) return null
        let nextNote = null

        const checkNextNotes = (section: MidiVisualizerNoteCoordinates[]) => {
            const nextNotes = section.filter(({ startingTime }) => startingTime > midiCurrentTime)
            if (nextNotes.length) {
                return nextNotes.reduce((prev, current) => (prev.y < current.y ? prev : current))
            }
        }

        const section = notesCoordinates.find((section) => sectionPlaying.toString() in section)

        if (section) {
            nextNote = checkNextNotes(Object.values(section)[0])
        }

        const nextSection = notesCoordinates.find(
            (section) => (sectionPlaying + 1).toString() in section
        )

        if (!nextNote && nextSection) {
            nextNote = checkNextNotes(Object.values(nextSection)[0])
        }

        return nextNote ? nextNote.startingTime : null // if there is no nextNote we might have reached the end of the song
    }

    getActiveNotes(
        notesCoordinates: SectionNoteCoordinates[],
        sectionPlaying: number,
        midiCurrentTime: number
    ): MidiVisualizerActiveNote[] {
        const section = notesCoordinates.find((section) => sectionPlaying.toString() in section)

        if (section) {
            const sectionNotes = Object.values(section)[0]
            const activeNotesCoordinates = sectionNotes.filter(
                (note: MidiVisualizerNoteCoordinates) =>
                    note.startingTime <= midiCurrentTime &&
                    note.startingTime + note.duration > midiCurrentTime
            )

            return MidiVisualizerCoordinates.noteCoordinatesToActiveNotes(activeNotesCoordinates)
        }

        return []
    }
}
