import { CanvasRectangle } from './Canvas'
import { AlphabeticalNote } from './Notes'

export interface NoteCoordinates extends CanvasRectangle {
    name: AlphabeticalNote
    key: number
    velocity: number
    duration: number // milliseconds
    id?: number
    channel: number
}
