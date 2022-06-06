interface Rect {
    x1: number
    x2: number
    y1: number
    y2: number
}

// checks if a rectangle 'a' contains another rectangle 'b'
export const isContainedBy = (a: Rect, b: Rect): boolean =>
    a.x1 <= b.x1 && a.y1 <= b.y1 && a.x2 >= b.x2 && a.y2 >= b.y2
