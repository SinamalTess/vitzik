import { ActiveNote, AudioPlayerState, MidiInfos, NoteCoordinates } from '../types'
import { getWidthKeys, isBlackKey as checkIsBlackKey } from './keyboard'
import { MIDI_PIANO_KEYS_OFFSET, NOTES } from './const'
import { IMidiFile } from 'midi-json-parser-worker'
import { getKey, getNoteMetas, isNoteOffEvent, isNoteOnEvent } from './midi'
import { isEven } from './maths'

interface PartialNote extends NoteCoordinates {
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
    midiInfos: MidiInfos

    constructor(midiInfos: MidiInfos) {
        this.midiInfos = midiInfos
        this.msPerBeat = this.midiInfos.msPerBeat
        this.midiDuration = this.midiInfos.midiDuration
        this.ticksPerBeat = this.midiInfos.ticksPerBeat
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
        midiInfos: MidiInfos,
        containerDimensions: { h: number; w: number }
    ) {
        super(midiInfos)

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
        midiInfos: MidiInfos,
        containerDimensions: { h: number; w: number }
    ) {
        super(heightPerBeat, midiInfos, containerDimensions)
    }

    static getNoteId = (trackIndex: number, note: ActiveNote) =>
        `${trackIndex}-${note.channel}-${note.name}`

    static mergeNotesCoordinates(activeTracks: number[], coordinates: NoteCoordinates[][][]) {
        if (!activeTracks.length || !coordinates.length) return [[]]
        const coordinatesActiveTracks = activeTracks.map((track) => coordinates[track])
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

    static noteCoordinatesToActiveNotes = (noteCoordinates: NoteCoordinates[]): ActiveNote[] =>
        noteCoordinates.map(({ name, velocity, id, duration, key, channel }) => ({
            name,
            velocity,
            duration,
            id,
            key,
            channel,
        }))

    getNotePartialCoordinates(note: ActiveNote, deltaAcc: number) {
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
            const previousKeys = NOTES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
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

        let notesCoordinates: NoteCoordinates[][][] = []

        tracks.forEach((track) => {
            let deltaAcc = 0
            let notesBeingProcessed: PartialNote[] = []
            let notesCoordinatesInTrack: NoteCoordinates[][] = Array(this.nbSectionInTrack).fill([])

            track.forEach((event, index) => {
                deltaAcc = deltaAcc + event.delta

                if (isNoteOnEvent(event)) {
                    const midiNote = getNoteMetas(event)
                    const noteCoordinates = this.getNotePartialCoordinates(midiNote, deltaAcc)

                    notesBeingProcessed.push({
                        ...noteCoordinates,
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
        notesCoordinates: NoteCoordinates[][],
        indexSectionPlaying: number,
        midiCurrentTime: number
    ) {
        const heightCurrentTime = this.timeToYPosition(midiCurrentTime)
        let nextNote = notesCoordinates[indexSectionPlaying].find(({ y }) => y > heightCurrentTime)
        const nextSection = notesCoordinates[indexSectionPlaying + 1]

        if (!nextNote && nextSection) {
            nextNote = nextSection.find((note) => note.y > heightCurrentTime)
        }

        return nextNote ? this.yPositionToTime(nextNote.y) : null // if there is no nextNote we might have reached the end of the song
    }

    getActiveNotes(
        notesCoordinates: NoteCoordinates[][],
        indexSectionPlaying: number,
        midiCurrentTime: number
    ): ActiveNote[] {
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
