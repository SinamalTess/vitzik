import { clamp, isEven, isPositive } from './index'

describe('isEven()', () => {
    it('should return "true" of a number is even', () => {
        expect(isEven(0)).toBe(true)
        expect(isEven(2)).toBe(true)
    })
    it('should return "false" of a number is uneven', () => {
        expect(isEven(1)).toBe(false)
        expect(isEven(3)).toBe(false)
    })
})

describe('isPositive()', () => {
    it('should return "true" of a number is positive', () => {
        expect(isPositive(0)).toBe(true)
        expect(isPositive(2)).toBe(true)
    })
    it('should return "false" of a number is negative', () => {
        expect(isPositive(-0)).toBe(false)
        expect(isPositive(-3)).toBe(false)
    })
})

describe('clamp()', () => {
    it('should return a number whose value is limited to the given range', () => {
        expect(clamp(0, 100, 300)).toBe(100)
        expect(clamp(50, 0, 100)).toBe(50)
        expect(clamp(120, 50, 100)).toBe(100)
    })
})
