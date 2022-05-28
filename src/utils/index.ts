import { keys_alphabetical } from './keys'

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
    return keys_alphabetical[key - 21] // 21 is the offset calculated from : https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
}
