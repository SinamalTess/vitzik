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
    getKeyFromNote,
    getNoteMetas,
    getWidthKeys,
    isBlackKey as checkIsBlackKey,
    isEven,
    isNoteOffEvent,
    isNoteOnEvent,
} from '../../utils'
import findLast from 'lodash/findLast'
import minBy from 'lodash/minBy'

interface PartialNote extends MidiVisualizerNoteCoordinates {
    deltaAcc: number
}

export interface SectionNoteCoordinates {
    [sectionIndex: number]: MidiVisualizerNoteCoordinates[]
}

export function init(midiMetas: MidiMetas, height: number, width: number, msPerSection: number) {
    const { ticksPerBeat } = midiMetas
    let msPerBeat = getInitialMsPerBeat(midiMetas.allMsPerBeat)
    const ratioSection = height / msPerSection

    function getMsPerBeatFromDelta(delta: number) {
        return findLast(midiMetas.allMsPerBeat, (msPerBeat) => msPerBeat.delta <= delta)
    }

    function deltaToTime(delta: number) {
        const lastMsPerBeat = getMsPerBeatFromDelta(delta)

        if (lastMsPerBeat) {
            const { timestamp, delta: lastDelta, value } = lastMsPerBeat
            return timestamp + ((delta - lastDelta) / ticksPerBeat) * value
        }

        return 0
    }

    const getIndexSectionPlaying = (time: number) => Math.floor(time / msPerSection)

    function getPercentageTopSection(time: number) {
        const exactNbSectionPassed = time / msPerSection
        const percentageTop = +((exactNbSectionPassed % 1) * 100).toFixed(2)
        const percentage1 = `${100 - percentageTop}%`
        const percentage2 = `-${percentageTop}%`
        const indexSectionPlaying = getIndexSectionPlaying(time)
        const isIndexEven = isEven(indexSectionPlaying)

        return {
            0: isIndexEven ? percentage2 : percentage1,
            1: isIndexEven ? percentage1 : percentage2,
        }
    }

    function getIndexToDraw(time: number, audioPlayerState: AudioPlayerState) {
        const indexSectionPlaying = getIndexSectionPlaying(time)
        const isIndexEven = isEven(indexSectionPlaying)
        if (indexSectionPlaying === 0) {
            return {
                0: 0,
                1: 1,
            }
        } else {
            if (audioPlayerState === 'playing') {
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

    function getNotePartialCoordinates(note: MidiInputActiveNote, deltaAcc: number) {
        const { name, key } = note
        const startingTime = deltaToTime(deltaAcc)
        const y = ratioSection * startingTime

        /*
            Some notes don't have associated names because they are just frequencies.
            See : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
            We won't render them visually, but they need to be played.
            Therefore, we pass a 'width' and 'x' of 0 --> to skip rendering
            But the 'y' and 'h' must be correct --> to play at the right timing
        */
        if (name) {
            const isBlackKey = checkIsBlackKey(name)
            const { widthWhiteKey, widthBlackKey } = getWidthKeys(width)
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

    function addNoteToSection(
        note: MidiVisualizerNoteCoordinates,
        notesCoordinatesInTrack: SectionNoteCoordinates[]
    ) {
        const startingSection = Math.floor(note.startingTime / msPerSection) // arrays start at 0, so we use floor to get number below
        const endingSection = Math.floor((note.startingTime + note.duration) / msPerSection)

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

    function getNotesCoordinates(midiFile: IMidiFile) {
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

                const lastMsPerBeat = getMsPerBeatFromDelta(deltaAcc)

                if (lastMsPerBeat && lastMsPerBeat.value !== msPerBeat) {
                    msPerBeat = lastMsPerBeat.value
                }

                if (isNoteOnEvent(event)) {
                    const midiNote = getNoteMetas(event)
                    const notePartialCoordinates = getNotePartialCoordinates(midiNote, deltaAcc)

                    notesBeingProcessed.push({
                        ...notePartialCoordinates,
                        ...midiNote,
                        duration: 0, // is replaced by the actual value after the noteOff event is received
                        id: getNoteId(index, midiNote),
                    })
                } else if (
                    isNoteOffEvent(event) ||
                    (isNoteOnEvent(event) && event.noteOn.velocity === 0)
                ) {
                    const key = getKeyFromNote(event)
                    const correspondingNoteOnIndex = notesBeingProcessed.findIndex(
                        (note) => note.key === key
                    )
                    if (correspondingNoteOnIndex !== -1) {
                        const note = { ...notesBeingProcessed[correspondingNoteOnIndex] }
                        note.duration = deltaToTime(deltaAcc) - note.startingTime
                        note.h = ratioSection * note.duration
                        addNoteToSection(note, notesCoordinatesInTrack)
                        notesBeingProcessed.splice(correspondingNoteOnIndex, 1)
                    }
                }
            })

            notesCoordinates.push(notesCoordinatesInTrack)
        })

        return notesCoordinates
    }

    function getTimeToNextNote(notesCoordinates: SectionNoteCoordinates[], time: number) {
        if (!notesCoordinates.length) return null

        const indexSectionPlaying = getIndexSectionPlaying(time)
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

    function getActiveNotes(
        notesCoordinates: SectionNoteCoordinates[],
        time: number
    ): MidiVisualizerActiveNote[] {
        const sectionPlaying = getIndexSectionPlaying(time)
        const section = notesCoordinates.find((section) => sectionPlaying.toString() in section)
        if (section) {
            const sectionNotes = Object.values(section)[0]
            const activeNotesCoordinates = sectionNotes.filter(
                ({ startingTime, duration }: MidiVisualizerNoteCoordinates) =>
                    startingTime <= time && startingTime + duration > time
            )

            return noteCoordinatesToActiveNotes(activeNotesCoordinates)
        }

        return []
    }

    return {
        getActiveNotes,
        getTimeToNextNote,
        getNotesCoordinates,
        getIndexToDraw,
        getPercentageTopSection,
    }
}

export function getMsPerBeatFromTime(allMsPerBeat: MsPerBeat[], time: number) {
    return (
        findLast(allMsPerBeat, (msPerBeat) => msPerBeat.timestamp <= time) ??
        allMsPerBeat.find((msPerBeat) => msPerBeat.timestamp >= time)
    )
}

const getNoteId = (trackIndex: number, note: MidiInputActiveNote) =>
    `${trackIndex}-${note.channel}-${note.name}`

export function mergeNotesCoordinates(
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

const noteCoordinatesToActiveNotes = (
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

export function getSectionCoordinates(
    notesCoordinates: SectionNoteCoordinates[] | undefined,
    indexToDraw: number,
    height: number
): MidiVisualizerNoteCoordinates[] {
    if (!notesCoordinates) return []
    const section = notesCoordinates.find((section) => indexToDraw.toString() in section)
    const coordinates: MidiVisualizerNoteCoordinates[] = section ? Object.values(section)[0] : []
    return coordinates.map((coordinate) => {
        return {
            ...coordinate,
            y: coordinate.y - indexToDraw * height,
        }
    })
}
