import { AlphabeticalNote, ActiveNote } from '../types'
import { NB_WHITE_PIANO_KEYS } from './const'

export const isBlackKey = (name: AlphabeticalNote) =>
    name.includes('#') ||
    // @ts-ignore
    [...name].some((character) => isNaN(character) && character === character.toLowerCase())

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

export const removeNotesFromActiveNotes = (activeNotes: ActiveNote[], notes: ActiveNote[]) =>
    activeNotes.filter(
        (activeNote) =>
            !notes.some(
                ({ channel, name }) => channel === activeNote.channel && name === activeNote.name
            )
    )
