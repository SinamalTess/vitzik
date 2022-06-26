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
    const activeKeysCopy = [...activeKeys]
    notes.forEach(({ channel, name }) => {
        const noteIndex = activeKeysCopy.findIndex(
            (activeKey) => activeKey.name === name && activeKey.channel === channel
        )
        if (noteIndex >= 0) {
            activeKeysCopy.splice(noteIndex, 1)
        }
    })
    return activeKeysCopy
}
