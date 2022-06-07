import { keyToNote, translateNote, noteToKey, isSpecialKey } from './index'

describe('keyToNote()', () => {
    test('converts MIDI piano key number to an alphabetical note', () => {
        expect(keyToNote(21)).toBe('A0')
        expect(keyToNote(22)).toBe('A#0/Bb0')
        expect(keyToNote(42)).toBe('F#2/Gb2')
    })
})

describe('noteToKey()', () => {
    test('converts an alphabetical note to a MIDI piano key number', () => {
        expect(noteToKey('A0')).toBe(21)
        expect(noteToKey('A#0/Bb0')).toBe(22)
        expect(noteToKey('F#2/Gb2')).toBe(42)
    })
})

describe('translateNote()', () => {
    test('translates a given note to the music system provided', () => {
        expect(translateNote('A0', 'german')).toBe('A0')
        expect(translateNote('C4', 'syllabic')).toBe('Do4')
        expect(translateNote('A0', 'syllabic')).toBe('La0')
        expect(translateNote('A0', 'alphabetical')).toBe('A0')
    })
})

describe('isSpecialKey()', () => {
    test('returns `true` if a key is either C or F', () => {
        expect(isSpecialKey('A0')).toBe(false)
        expect(isSpecialKey('D4')).toBe(false)
        expect(isSpecialKey('F1')).toBe(true)
        expect(isSpecialKey('C1')).toBe(true)
    })
})
