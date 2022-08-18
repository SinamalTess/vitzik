import { msToHumanReadableTime, msToSec } from './time'

describe('msToHumanReadableTime()', () => {
    describe('When the showMs parameter is "false"', () => {
        it('should convert milliseconds to minutes and seconds', () => {
            expect(msToHumanReadableTime(2100)).toBe('00:02')
            expect(msToHumanReadableTime(240000)).toBe('04:00')
        })
    })

    describe('When the showMs parameter is "true"', () => {
        it('should convert milliseconds to minutes, seconds and milliseconds', () => {
            expect(msToHumanReadableTime(2100, true)).toBe('00:02:100')
            expect(msToHumanReadableTime(240000, true)).toBe('04:00:00')
        })
    })
})

describe('msToSec()', () => {
    it('should convert milliseconds to seconds', () => {
        expect(msToSec(2100)).toBe(2.1)
        expect(msToSec(240000)).toBe(240)
    })
})
