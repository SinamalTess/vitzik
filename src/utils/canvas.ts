import { isNoteOn, MidiJsonNote } from '../types'
import { noteKeyToName } from './notes'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from './const'
import { MidiTrackInfos } from '../components/Visualizer'

interface Rectangle {
    x1: number
    x2: number
    y1: number
    y2: number
}

interface Point {
    x: number
    y: number
}

export interface CanvasRectangle {
    w: number // width
    h: number // height
    x: number
    y: number
}

type RectangleCoordinates = number[][]

export function isHTMLCanvasElement(element: ChildNode): element is HTMLCanvasElement {
    return element.nodeName === 'CANVAS'
}

// checks if a rectangle 'a' contains another rectangle 'b'
export const isContainedBy = (a: Rectangle, b: Rectangle): boolean =>
    a.x1 <= b.x1 && a.y1 <= b.y1 && a.x2 >= b.x2 && a.y2 >= b.y2

// checks if a point is inside the given rectangle
export const isPointInRect = ({ x1, y1, x2, y2 }: Rectangle, { x, y }: Point) =>
    x > x1 && x < x2 && y > y1 && y < y2

// checks if a rectangle 'a' is at least partially inside another
export function isPartiallyIn(coordinates: RectangleCoordinates, rectangle: Rectangle) {
    return coordinates.some((coordinate) =>
        isPointInRect(rectangle, { x: coordinate[0], y: coordinate[1] })
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

        if (isNoteOn(note)) {
            let heightAcc = 0
            const key = note.noteOn.noteNumber
            const noteName = noteKeyToName(key)
            const isBlackKey = noteName.includes('#')
            const noteOffIndex = notes.findIndex(
                (note, i) => !isNoteOn(note) && note.noteOff.noteNumber === key && i > index
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
