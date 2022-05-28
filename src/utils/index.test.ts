import { formatToPixelValue } from './index'

describe('formatToPixelValue', () => {
    test('returns px value', () => {
        expect(formatToPixelValue('100')).toBe('100px')
    })
})
