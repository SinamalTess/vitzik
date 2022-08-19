import { keyToNote, translateNoteTo, noteToKey, isSpecialNote } from './index'
import { KeyboardFactory } from '../components/Keyboard/KeyboardFactory'

describe('keyToNote()', () => {
    it('should convert MIDI piano key number to an alphabetical note', () => {
        expect(keyToNote(21)).toBe('A0')
        expect(keyToNote(22)).toBe('Bb0')
        expect(keyToNote(42)).toBe('Gb2')
    })
})

describe('noteToKey()', () => {
    it('should convert an alphabetical note to a MIDI piano key number', () => {
        expect(noteToKey('A0')).toBe(21)
        expect(noteToKey('Bb0')).toBe(22)
        expect(noteToKey('Gb2')).toBe(42)
    })
})

describe('translateNoteTo()', () => {
    it('should translate a given note to the music system provided', () => {
        expect(translateNoteTo('A0', 'german')).toBe('A0')
        expect(translateNoteTo('C4', 'syllabic')).toBe('Do4')
        expect(translateNoteTo('A0', 'syllabic')).toBe('La0')
        expect(translateNoteTo('A0', 'alphabetical')).toBe('A0')
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
        expect(KeyboardFactory.isBlackKey('A0')).toBe(false)
        expect(KeyboardFactory.isBlackKey('D4')).toBe(false)
        expect(KeyboardFactory.isBlackKey('Bb0')).toBe(true)
        expect(KeyboardFactory.isBlackKey('Gb2')).toBe(true)
    })
})
