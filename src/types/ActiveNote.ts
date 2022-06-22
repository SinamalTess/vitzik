import { AlphabeticalNote } from './Notes'

export interface ActiveNote {
    name: AlphabeticalNote
    velocity: number
    id?: number
    duration?: number
    key: number
    channel: number
}
