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

export function isPointInRect(
    point: Point,
    rectB: Rectangle,
    excludeBorders: boolean = false
): boolean {
    if (excludeBorders) {
        return point.x > rectB.x1 && point.x < rectB.x2 && point.y > rectB.y1 && point.y < rectB.y2
    } else {
        return (
            point.x >= rectB.x1 && point.x <= rectB.x2 && point.y >= rectB.y1 && point.y <= rectB.y2
        )
    }
}

export function isPartiallyIn(coordinates: RectangleCoordinates, rectangle: Rectangle) {
    return coordinates.some((coordinate) =>
        isPointInRect({ x: coordinate[0], y: coordinate[1] }, rectangle)
    )
}

export function getCoordinates({ x, y, h, w }: CanvasRectangle): RectangleCoordinates {
    return [
        [x, y + h],
        [x + w, y + h],
        [x, y],
        [x + w, y],
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
