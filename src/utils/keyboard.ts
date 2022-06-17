import { AlphabeticalNote } from '../types'
import { NB_WHITE_PIANO_KEYS } from './const'

export const isBlackKey = (note: AlphabeticalNote) => note.includes('#')

export const isSpecialNote = (note: AlphabeticalNote) => note.includes('C') || note.includes('F')

export const getWidthKeys = (
    totalWidth: number
): { widthWhiteKey: number; widthBlackKey: number } => {
    const widthWhiteKey = totalWidth / NB_WHITE_PIANO_KEYS
    return {
        widthWhiteKey,
        widthBlackKey: widthWhiteKey / 2,
    }
}

export const getWidthWhiteKey = (totalWidth: number) => totalWidth / NB_WHITE_PIANO_KEYS

export const getWidthBlackKey = (totalWidth: number) => totalWidth / NB_WHITE_PIANO_KEYS / 2
