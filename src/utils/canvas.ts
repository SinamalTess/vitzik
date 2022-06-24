import { Point, Rectangle } from '../types'

interface Radius {
    tl: number
    tr: number
    br: number
    bl: number
}

const isRadius = (value: any): value is Radius =>
    'tl' in value && 'tr' in value && 'br' in value && 'bl' in value

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

export function drawRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number | { tl?: number; tr?: number; br?: number; bl?: number } = 5,
    fill = false,
    stroke = true
) {
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius }
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius }
    }
    if (isRadius(radius)) {
        ctx.beginPath()
        ctx.moveTo(x + radius.tl, y)
        ctx.lineTo(x + w - radius.tr, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr)
        ctx.lineTo(x + w, y + h - radius.br)
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h)
        ctx.lineTo(x + radius.bl, y + h)
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl)
        ctx.lineTo(x, y + radius.tl)
        ctx.quadraticCurveTo(x, y, x + radius.tl, y)
        ctx.closePath()
        if (fill) {
            ctx.fill()
        }
        if (stroke) {
            ctx.stroke()
        }
    }
}
