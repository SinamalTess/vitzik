import { AlphabeticalNote } from '../types'
import { NB_WHITE_PIANO_KEYS } from './const'

export const isSpecialNote = (note: AlphabeticalNote) => note.includes('C') || note.includes('F')

export const getWidthKeys = (
    widthContainer: number
): { widthWhiteKey: number; widthBlackKey: number } => {
    const widthWhiteKey = widthContainer / NB_WHITE_PIANO_KEYS
    return {
        widthWhiteKey,
        widthBlackKey: widthWhiteKey / 2,
    }
}

export const getWidthWhiteKey = (widthContainer: number) => widthContainer / NB_WHITE_PIANO_KEYS

export const getWidthBlackKey = (widthContainer: number) => widthContainer / NB_WHITE_PIANO_KEYS / 2
