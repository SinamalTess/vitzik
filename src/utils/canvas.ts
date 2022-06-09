import {
    CanvasRectangle,
    isNoteOnEvent,
    MidiJsonNote,
    NoteCoordinates,
    Point,
    Rectangle,
} from '../types'
import { keyToNote } from './notes'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from './const'
import { MidiTrackInfos } from '../components/Visualizer'

export const isContainedBy = (rectA: Rectangle, rectB: Rectangle): boolean =>
    rectA.x1 <= rectB.x1 && rectA.y1 <= rectB.y1 && rectA.x2 >= rectB.x2 && rectA.y2 >= rectB.y2

export const isOverlapping = (rectA: Rectangle, rectB: Rectangle): boolean => {
    // no horizontal overlap
    if (rectA.x1 >= rectB.x2 || rectB.x1 >= rectA.x2) return false

    // no vertical overlap
    return !(rectA.y1 >= rectB.y2 || rectB.y1 >= rectA.y2)
}

export const isPointInRect = (
    point: Point,
    rect: Rectangle,
    excludeBorders: boolean = false
): boolean => {
    if (excludeBorders)
        return point.x > rect.x1 && point.x < rect.x2 && point.y > rect.y1 && point.y < rect.y2

    return point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y1 && point.y <= rect.y2
}

export const convertCanvasRectToRect = (rect: CanvasRectangle): Rectangle => ({
    x1: rect.x,
    x2: rect.x + rect.w,
    y1: rect.y,
    y2: rect.y + rect.h,
})

export function getNotesCoordinates(
    canvasWidth: number,
    notes: MidiJsonNote[],
    heightPerBeat: number,
    midiInfos: MidiTrackInfos
) {
    let notesCoordinates: NoteCoordinates[] = []
    let deltaAcc = 0
    let notesBeingProcessed: NoteCoordinates[] = []

    notes.forEach((note, index) => {
        deltaAcc = deltaAcc + note.delta
        const key = isNoteOnEvent(note) ? note.noteOn.noteNumber : note.noteOff.noteNumber
        const noteName = keyToNote(key)
        const velocity = isNoteOnEvent(note) ? note.noteOn.velocity : note.noteOff.velocity

        if (isNoteOnEvent(note)) {
            const isBlackKey = noteName.includes('#')
            const widthWhiteKey = canvasWidth / NB_WHITE_PIANO_KEYS
            const w = isBlackKey ? widthWhiteKey / 2 : widthWhiteKey
            const previousKeys = NOTES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
            const nbPreviousWhiteKeys = previousKeys.filter((note) => !note.includes('#')).length
            const margin = !isBlackKey ? widthWhiteKey / 4 : widthWhiteKey / 2
            const x = nbPreviousWhiteKeys * widthWhiteKey - margin
            const y = (deltaAcc / midiInfos.ticksPerBeat) * heightPerBeat

            const note: NoteCoordinates = {
                w,
                h: deltaAcc,
                x,
                y,
                name: noteName,
                key,
                velocity,
                duration: 0,
                id: index,
            }

            notesBeingProcessed.push(note)
        } else {
            const noteOnIndex = notesBeingProcessed.findIndex((note, i) => note.key === key)

            if (noteOnIndex) {
                const note = { ...notesBeingProcessed[noteOnIndex] }
                note.duration = ((deltaAcc - note.h) / midiInfos.ticksPerBeat) * midiInfos.msPerBeat
                note.h = ((deltaAcc - note.h) / midiInfos.ticksPerBeat) * heightPerBeat
                notesCoordinates.push(note)
                notesBeingProcessed.splice(noteOnIndex, 1)
            }
        }
    })

    return notesCoordinates
}
