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
    w: number // width (px)
    h: number // height (px)
    x: number // (px)
    y: number // (px)
}

export interface NoteCoordinates extends CanvasRectangle {
    name: AlphabeticalNote
    key: number
    velocity: number
    duration: number // ms
    id?: number
}

export function isHTMLCanvasElement(element: ChildNode): element is HTMLCanvasElement {
    return element.nodeName === 'CANVAS'
}
