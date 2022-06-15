import { isEven } from './index'

describe('isEven()', () => {
    test('returns true of a number is even', () => {
        expect(isEven(0)).toBe(true)
        expect(isEven(1)).toBe(false)
        expect(isEven(2)).toBe(true)
        expect(isEven(3)).toBe(false)
    })
})
