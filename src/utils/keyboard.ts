import { ActiveNote, AlphabeticalNote } from '../types'
import { NB_WHITE_PIANO_KEYS } from './const'

export const isBlackKey = (note: AlphabeticalNote) => note?.includes('#')

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

export function removeNotesFromActiveKeys(activeKeys: ActiveNote[], notes: ActiveNote[]) {
    return activeKeys.filter((activeKey) => {
        return !notes.some(
            ({ channel, name }) => channel === activeKey.channel && name === activeKey.name
        )
    })
}
