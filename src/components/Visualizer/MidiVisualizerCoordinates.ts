import {
    MidiVisualizerActiveNote,
    AudioPlayerState,
    MidiMetas,
    MidiVisualizerNoteCoordinates,
    MidiInputActiveNote,
} from '../../types'
import { MIDI_PIANO_KEYS_OFFSET, NOTE_NAMES } from '../../utils/const'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    getKey,
    getNoteMetas,
    isNoteOffEvent,
    isNoteOnEvent,
    isEven,
    getWidthKeys,
    isBlackKey as checkIsBlackKey,
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
        this.msPerBeat = this.midiMetas.msPerBeat
        this.midiDuration = this.midiMetas.midiDuration
        this.ticksPerBeat = this.midiMetas.ticksPerBeat
    }
}

class MidiVisualizerPositions extends MidiTimeInfos {
    heightPerBeat: number
    containerDimensions: { h: number; w: number }
    nbBeatsPerSection: number
    msPerSection: number
    nbSectionInTrack: number

    constructor(
        heightPerBeat: number,
        midiMetas: MidiMetas,
        containerDimensions: { h: number; w: number }
    ) {
        super(midiMetas)

        this.heightPerBeat = heightPerBeat
        this.containerDimensions = containerDimensions
        this.nbBeatsPerSection = containerDimensions.h / this.heightPerBeat
        this.msPerSection = this.msPerBeat * this.nbBeatsPerSection
        this.nbSectionInTrack = Math.ceil(this.midiDuration / this.msPerSection)
    }

    getSectionNames = (): SectionName[] => ['firstSection', 'secondSection']

    yPositionToTime = (y: number) => (y / this.heightPerBeat) * this.msPerBeat

    timeToYPosition = (time: number) => (time / this.msPerBeat) * this.heightPerBeat

    getIndexSectionPlaying = (midiCurrentTime: number) =>
        Math.floor(this.timeToYPosition(midiCurrentTime) / this.containerDimensions.h)

    getPercentageTopSection(sectionName: SectionName, midiCurrentTime: number) {
        const heightDuration = this.timeToYPosition(midiCurrentTime)
        const nbSectionPassed = heightDuration / this.containerDimensions.h
        const percentageTop = +((nbSectionPassed % 1) * 100).toFixed(2)
        const percentageFirstSection = `${100 - percentageTop}%`
        const percentageSecondSection = `-${percentageTop}%`
        const indexSectionPlaying = this.getIndexSectionPlaying(midiCurrentTime)
        const isIndexEven = isEven(indexSectionPlaying)

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
    constructor(
        heightPerBeat: number,
        midiMetas: MidiMetas,
        containerDimensions: { h: number; w: number }
    ) {
        super(heightPerBeat, midiMetas, containerDimensions)
    }

    static getNoteId = (trackIndex: number, note: MidiInputActiveNote) =>
        `${trackIndex}-${note.channel}-${note.name}`

    static mergeNotesCoordinates(
        activeTracks: number[],
        noteCoordinates: MidiVisualizerNoteCoordinates[][][]
    ) {
        if (
            !activeTracks.length ||
            !noteCoordinates.length ||
            activeTracks.length > noteCoordinates.length
        )
            return [[]]
        const coordinatesActiveTracks = activeTracks.map((track) => noteCoordinates[track])
        const nbCoordinates = coordinatesActiveTracks[0].length
        return coordinatesActiveTracks.reduce(
            (previousCoordinatesActiveTrack, currentCoordinatesActiveTrack) => {
                let acc = []

                for (let i = 0; i < nbCoordinates; i++) {
                    acc.push(
                        previousCoordinatesActiveTrack[i].concat(currentCoordinatesActiveTrack[i])
                    )
                }

                return acc
            },
            Array(nbCoordinates).fill([])
        )
    }

    static noteCoordinatesToActiveNotes = (
        noteCoordinates: MidiVisualizerNoteCoordinates[]
    ): MidiVisualizerActiveNote[] =>
        noteCoordinates.map(({ name, velocity, id, duration, key, channel }) => ({
            name,
            velocity,
            duration,
            id,
            key,
            channel,
        }))

    getNotePartialCoordinates(note: MidiInputActiveNote, deltaAcc: number) {
        const { name, key } = note
        const y = (deltaAcc / this.ticksPerBeat) * this.heightPerBeat
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
                h: 0,
                x,
                deltaAcc,
            }
        } else {
            return {
                w: 0,
                y,
                h: 0,
                x: 0,
                deltaAcc,
            }
        }
    }

    getNotesCoordinates(midiFile: IMidiFile) {
        const { h } = this.containerDimensions
        const { tracks } = midiFile

        let notesCoordinates: MidiVisualizerNoteCoordinates[][][] = []

        tracks.forEach((track) => {
            let deltaAcc = 0
            let notesBeingProcessed: PartialNote[] = []
            let notesCoordinatesInTrack: MidiVisualizerNoteCoordinates[][] = Array(
                this.nbSectionInTrack
            ).fill([])

            track.forEach((event, index) => {
                deltaAcc = deltaAcc + event.delta

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
                        const nbBeatsInNote = (deltaAcc - note.deltaAcc) / this.ticksPerBeat
                        note.duration = nbBeatsInNote * this.msPerBeat
                        note.h = nbBeatsInNote * this.heightPerBeat
                        const startingSection = Math.floor(note.y / h) // arrays start at 0, so we use floor to get number below
                        const endingSection = Math.floor((note.y + note.h) / h)
                        notesBeingProcessed.splice(correspondingNoteOnIndex, 1)
                        for (let i = startingSection; i <= endingSection; i++) {
                            notesCoordinatesInTrack[i] = [...notesCoordinatesInTrack[i], note]
                        }
                    }
                }
            })

            notesCoordinates.push(notesCoordinatesInTrack)
        })

        return notesCoordinates
    }

    getTimeToNextNote(
        notesCoordinates: MidiVisualizerNoteCoordinates[][],
        indexSectionPlaying: number,
        midiCurrentTime: number
    ) {
        if (!notesCoordinates.length || !notesCoordinates[indexSectionPlaying]) return 0
        const heightCurrentTime = this.timeToYPosition(midiCurrentTime)

        const checkNextNotes = (section: MidiVisualizerNoteCoordinates[]) => {
            const nextNotes = section.filter(({ y }) => y > heightCurrentTime)
            if (nextNotes.length) {
                return nextNotes.reduce((prev, current) => (prev.y < current.y ? prev : current))
            }
        }

        let nextNote = checkNextNotes(notesCoordinates[indexSectionPlaying])

        const nextSection = notesCoordinates[indexSectionPlaying + 1]

        if (!nextNote && nextSection) {
            nextNote = checkNextNotes(nextSection)
        }

        return nextNote ? this.yPositionToTime(nextNote.y) : null // if there is no nextNote we might have reached the end of the song
    }

    getActiveNotes(
        notesCoordinates: MidiVisualizerNoteCoordinates[][],
        indexSectionPlaying: number,
        midiCurrentTime: number
    ): MidiVisualizerActiveNote[] {
        const heightCurrentTime = this.timeToYPosition(midiCurrentTime)

        if (notesCoordinates[indexSectionPlaying] && notesCoordinates[indexSectionPlaying].length) {
            const activeNotesCoordinates = notesCoordinates[indexSectionPlaying].filter(
                (note) => note.y <= heightCurrentTime && note.y + note.h > heightCurrentTime
            )

            return MidiVisualizerCoordinates.noteCoordinatesToActiveNotes(activeNotesCoordinates)
        }
        return []
    }
}
