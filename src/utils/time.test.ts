import { msToMinAndSec, msToSec } from './time'

describe('msToMinAndSec()', () => {
    it('converts milliseconds to minutes and seconds', () => {
        expect(msToMinAndSec(2100)).toBe('00:02')
        expect(msToMinAndSec(240000)).toBe('04:00')
    })
})

describe('msToSec()', () => {
    it('converts milliseconds to seconds', () => {
        expect(msToSec(2100)).toBe(2.1)
        expect(msToSec(240000)).toBe(240)
    })
})
