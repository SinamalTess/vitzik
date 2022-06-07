import {
    CanvasRectangle,
    isNoteOnEvent,
    MidiJsonNote,
    Point,
    Rectangle,
    RectangleCoordinates,
} from '../types'
import { keyToNote } from './notes'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from './const'
import { MidiTrackInfos } from '../components/Visualizer'

export function isContainedBy(rectA: Rectangle, rectB: Rectangle): boolean {
    return (
        rectA.x1 <= rectB.x1 && rectA.y1 <= rectB.y1 && rectA.x2 >= rectB.x2 && rectA.y2 >= rectB.y2
    )
}

export function isPartiallyIn(rectA: Rectangle, rectB: Rectangle) {
    const coordinates = getCoordinates(rectA)
    return coordinates.some((coordinate) =>
        isPointInRect({ x: coordinate[0], y: coordinate[1] }, rectB)
    )
}

export function isPointInRect(
    point: Point,
    rect: Rectangle,
    excludeBorders: boolean = false
): boolean {
    if (excludeBorders) {
        return point.x > rect.x1 && point.x < rect.x2 && point.y > rect.y1 && point.y < rect.y2
    } else {
        return point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y1 && point.y <= rect.y2
    }
}

export function convertCanvasRect(rect: CanvasRectangle): Rectangle {
    return {
        x1: rect.x,
        x2: rect.x + rect.w,
        y1: rect.y,
        y2: rect.y + rect.h,
    }
}

export function getCoordinates({ x1, y1, y2, x2 }: Rectangle): RectangleCoordinates {
    return [
        [x1, y1],
        [x1, y2],
        [x2, y1],
        [x2, y2],
    ]
}

export function getNotesCoordinates(
    canvasWidth: number,
    notes: MidiJsonNote[],
    heightPerBeat: number,
    midiInfos: MidiTrackInfos
) {
    let rectangles: CanvasRectangle[] = []
    let deltaAcc = 0

    notes.forEach((note, index) => {
        deltaAcc = deltaAcc + note.delta

        if (isNoteOnEvent(note)) {
            let heightAcc = 0
            const key = note.noteOn.noteNumber
            const noteName = keyToNote(key)
            const isBlackKey = noteName.includes('#')
            const noteOffIndex = notes.findIndex(
                (note, i) => !isNoteOnEvent(note) && note.noteOff.noteNumber === key && i > index
            )
            const widthWhiteKey = canvasWidth / NB_WHITE_PIANO_KEYS
            const w = isBlackKey ? widthWhiteKey / 2 : widthWhiteKey
            const previousKeys = NOTES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
            const nbPreviousWhiteKeys = previousKeys.filter((note) => !note.includes('#')).length
            const margin = !isBlackKey ? widthWhiteKey / 4 : widthWhiteKey / 2
            const x = nbPreviousWhiteKeys * widthWhiteKey - margin

            if (noteOffIndex > 0) {
                for (let y = 0; y <= noteOffIndex - index; y++) {
                    heightAcc = heightAcc + notes[index + y].delta
                }
            }

            const h = (heightAcc / midiInfos.ticksPerBeat) * heightPerBeat
            const y = (deltaAcc / midiInfos.ticksPerBeat) * heightPerBeat

            rectangles.push({ w, h, x, y })
        }
    })

    return rectangles
}
