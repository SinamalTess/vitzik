import {
    keyToNote,
    translateNoteToMusicSystem,
    noteToKey,
    isSpecialNote,
    isBlackKey,
} from './index'

describe('keyToNote()', () => {
    it('should convert MIDI piano key number to an alphabetical note', () => {
        expect(keyToNote(21)).toBe('A0')
        expect(keyToNote(22)).toBe('A#0/Bb0')
        expect(keyToNote(42)).toBe('F#2/Gb2')
    })
})

describe('noteToKey()', () => {
    it('should convert an alphabetical note to a MIDI piano key number', () => {
        expect(noteToKey('A0')).toBe(21)
        expect(noteToKey('A#0/Bb0')).toBe(22)
        expect(noteToKey('F#2/Gb2')).toBe(42)
    })
})

describe('translateNote()', () => {
    it('should translate a given note to the music system provided', () => {
        expect(translateNoteToMusicSystem('A0', 'german')).toBe('A0')
        expect(translateNoteToMusicSystem('C4', 'syllabic')).toBe('Do4')
        expect(translateNoteToMusicSystem('A0', 'syllabic')).toBe('La0')
        expect(translateNoteToMusicSystem('A0', 'alphabetical')).toBe('A0')
    })
})

describe('isSpecialNote()', () => {
    it('should return `true` if a key is either C or F', () => {
        expect(isSpecialNote('A0')).toBe(false)
        expect(isSpecialNote('D4')).toBe(false)
        expect(isSpecialNote('F1')).toBe(true)
        expect(isSpecialNote('C1')).toBe(true)
    })
})

describe('isBlackKey()', () => {
    it('should return `true` if a note corresponds to a black key', () => {
        expect(isBlackKey('A0')).toBe(false)
        expect(isBlackKey('D4')).toBe(false)
        expect(isBlackKey('A#0/Bb0')).toBe(true)
        expect(isBlackKey('F#2/Gb2')).toBe(true)
    })
})
