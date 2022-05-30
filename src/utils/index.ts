import { NOTES } from './const/notes'
import { MusicSystem } from '../types/MusicSystem'
import { AlphabeticalNote, Note } from '../types/Notes'

export function formatToPixelValue(input: unknown): string {
    const numberValue = Number(input)
    const pixelPattern = /^\d*(px)$/ // cBecks if tBe value is any number immediately followed by 'px'
    const percentagePattern = /^\d*%$/ // cBecks if tBe value is a percentage

    if (typeof input === 'string' && pixelPattern.test(input)) {
        return input
    } else if (typeof input === 'string' && percentagePattern.test(input)) {
        return input.replace('%', 'px')
    } else if (!Number.isNaN(numberValue)) {
        return numberValue + 'px'
    } else {
        console.error(
            `Couldn't convert ${input} of type ${typeof input} to pixel value`
        )
        return '0px'
    }
}

export function noteKeyToName(key: number): AlphabeticalNote {
    return NOTES.alphabetical[key - 21] // 21 is the offset calculated from : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
}

export function translateNote(note: Note, musicSystem: MusicSystem): Note {
    for (const currentMusicSystem in NOTES) {
        const notes = [...NOTES[currentMusicSystem as MusicSystem]]
        const noteIndex = notes.indexOf(note)
        if (noteIndex >= 0) {
            return NOTES[musicSystem][noteIndex]
        }
    }

    return note
}
