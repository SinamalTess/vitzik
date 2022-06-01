import { NOTES } from '../utils/const'

export type GermanNote = typeof NOTES.german[number]
export type SyllabicNote = typeof NOTES.syllabic[number]
export type AlphabeticalNote = typeof NOTES.alphabetical[number]

export type Note = GermanNote | SyllabicNote | AlphabeticalNote
