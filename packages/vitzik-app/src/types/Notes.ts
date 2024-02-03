import { NOTE_NAMES } from '../const'

export type GermanNote = (typeof NOTE_NAMES.german)[number]
export type SyllabicNote = (typeof NOTE_NAMES.syllabic)[number]
export type AlphabeticalNote = (typeof NOTE_NAMES.alphabetical)[number]

export type Note = GermanNote | SyllabicNote | AlphabeticalNote
