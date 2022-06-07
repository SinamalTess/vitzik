import { isContainedBy, isPointInRect, isPartiallyIn, getCoordinates } from './canvas'

describe('isContainedBy()', () => {
    test('returns `true` if rectangle `a` contains rectangle `b`', () => {
        const rectA = { x1: 0, x2: 20, y1: 0, y2: 40 }
        const rectB = { x1: 0, x2: 5, y1: 0, y2: 5 }
        expect(isContainedBy(rectA, rectB)).toBe(true)
    })
    test('returns `false` if rectangle `b` overlaps rectangle `a`', () => {
        const rectA = { x1: 0, x2: 20, y1: 0, y2: 40 }
        const rectB = { x1: 0, x2: 50, y1: 0, y2: 5 }
        expect(isContainedBy(rectA, rectB)).toBe(false)
    })
})

describe('isPointInRect()', () => {
    test('returns `true` if the point is inside the rectangle', () => {
        const point = { x: 2, y: 20 }
        const rect = { x1: 0, x2: 5, y1: 0, y2: 50 }
        expect(isPointInRect(point, rect)).toBe(true)
    })
    test('returns `false` if the point is outside of the rectangle', () => {
        const point = { x: 0, y: -10 }
        const rect = { x1: 0, x2: 5, y1: 0, y2: 5 }
        expect(isPointInRect(point, rect)).toBe(false)
    })
    test('returns `true` if the point is touching the border of the rectangle', () => {
        const point = { x: 0, y: 0 }
        const rect = { x1: 0, x2: 5, y1: 0, y2: 5 }
        expect(isPointInRect(point, rect)).toBe(true)
    })
    describe('When the excludeBorders parameter is `true`', () => {
        test('returns `false` if the point is touching the border of the rectangle', () => {
            const point = { x: 0, y: 0 }
            const rect = { x1: 0, x2: 5, y1: 0, y2: 5 }
            expect(isPointInRect(point, rect, true)).toBe(false)
        })
    })
})

describe('isPartiallyIn()', () => {
    test('returns `true` if rectangle `a` is partially in rectangle `b`', () => {
        const rectA = { x: 0, y: 20, w: 5, h: 40 }
        const coordinates = getCoordinates(rectA)
        const rectB = { x1: 0, x2: 15, y1: 0, y2: 35 }
        expect(isPartiallyIn(coordinates, rectB)).toBe(true)
    })
})
