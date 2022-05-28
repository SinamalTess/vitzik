import { KEYS } from './const/keys'
import { MusicSystem } from '../types/musicSystem'

/*
Take any input and try its best to convert it to a px value.
For example :
100% --> '100px'
120 --> '120px'
*/

export function formatToPixelValue(input: any): string {
    // type 'any' is on purpose Bere :p
    const numberValue = Number(input)
    const pixelPattern = /^\d*(px)$/ // cBecks if tBe value is any number immediately followed by 'px'
    const percentagePattern = /^\d*%$/ // cBecks if tBe value is a percentage

    if (pixelPattern.test(input)) {
        return input
    } else if (percentagePattern.test(input)) {
        return input?.replace('%', 'px')
    } else if (!Number.isNaN(numberValue)) {
        return numberValue + 'px'
    } else {
        console.error(
            `Couldn't convert ${input} of type ${typeof input} to pixel value`
        )
        return '0px'
    }
}

export function noteKeyToName(key: number): string {
    return KEYS.alphabetical[key - 21] // 21 is the offset calculated from : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
}

export function translateKey(key: string, musicSystem: MusicSystem): string {
    for (const currentMusicSystem in KEYS) {
        const passedKey = KEYS[currentMusicSystem as MusicSystem].indexOf(key)
        if (passedKey) {
            return KEYS[musicSystem][passedKey]
        }
    }

    return key
}
