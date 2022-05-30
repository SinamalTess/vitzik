import { noteKeyToName, translateNote } from './index'

describe('noteKeyToName()', () => {
    test('converts MIDI piano key to note', () => {
        expect(noteKeyToName(21)).toBe('A0')
        expect(noteKeyToName(22)).toBe('A#0/Bb0')
        expect(noteKeyToName(42)).toBe('F#2/Gb2')
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
