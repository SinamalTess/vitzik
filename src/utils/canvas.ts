import { number } from 'prop-types'

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

// checks if a rectangle 'a' contains another rectangle 'b'
export const isContainedBy = (a: Rectangle, b: Rectangle): boolean =>
    a.x1 <= b.x1 && a.y1 <= b.y1 && a.x2 >= b.x2 && a.y2 >= b.y2

// checks if a point is inside the given rectangle
export const isPointInRect = ({ x1, y1, x2, y2 }: Rectangle, { x, y }: Point) =>
    x > x1 && x < x2 && y > y1 && y < y2

export const getCoordinates = ({ x, y, h, w }: CanvasRectangle) => {
    return [
        [x, y + h],
        [x + w, y + h],
        [x, y],
        [x + w, y],
    ]
}
