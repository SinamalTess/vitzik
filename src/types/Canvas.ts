import { AlphabeticalNote } from './Notes'

export interface Rectangle {
    x1: number
    x2: number
    y1: number
    y2: number
}

export interface Point {
    x: number
    y: number
}

export interface CanvasRectangle {
    w: number // width
    h: number // height
    x: number
    y: number
}

export interface NoteCoordinates extends CanvasRectangle {
    name: AlphabeticalNote
    key: number
    velocity: number
}

export type RectangleCoordinates = number[][]

export function isHTMLCanvasElement(element: ChildNode): element is HTMLCanvasElement {
    return element.nodeName === 'CANVAS'
}
