import {
    KEYBOARD_CHANNEL,
    MIDI_PIANO_KEYS_OFFSET,
    NB_WHITE_PIANO_KEYS,
    NOTE_NAMES,
} from '../../utils/const'
import { clamp, noteToKey } from '../../utils'
import { AlphabeticalNote } from '../../types'

export class Keyboard {
    private width: number
    private velocity: number
    widthWhiteKey: number
    widthBlackKey: number

    constructor(width: number, velocity: number = 0) {
        this.width = width
        this.velocity = velocity
        this.widthWhiteKey = width / NB_WHITE_PIANO_KEYS
        this.widthBlackKey = width / NB_WHITE_PIANO_KEYS / 2
    }

    set setVelocity(velocity: number) {
        this.velocity = clamp(velocity, 0, 127)
    }

    get getVelocity() {
        return this.velocity
    }

    getKeys() {
        return NOTE_NAMES.alphabetical.map((name) => ({
            name,
            velocity: this.velocity,
            key: noteToKey(name),
            channel: KEYBOARD_CHANNEL,
        }))
    }

    static isBlackKey(keyName: AlphabeticalNote) {
        const hasHastag = keyName.includes('#')
        const isLowerCaseCharacter = (character: string) =>
            // @ts-ignore
            isNaN(character) && character === character.toLowerCase()
        const hasLowerCaseCharacters = [...keyName].some((character) =>
            isLowerCaseCharacter(character)
        )

        return hasHastag || hasLowerCaseCharacters
    }

    static isSpecialKey = (keyName: AlphabeticalNote) =>
        keyName.includes('C') || keyName.includes('F')

    getWidthKeys = () => {
        return {
            widthWhiteKey: this.widthWhiteKey,
            widthBlackKey: this.widthBlackKey,
        }
    }

    getWidthKey = (keyName: AlphabeticalNote) => {
        const isBlackKey = Keyboard.isBlackKey(keyName)

        return isBlackKey ? this.widthBlackKey : this.widthWhiteKey
    }

    getMarginKey = (keyName: AlphabeticalNote) => {
        const isBlackKey = Keyboard.isBlackKey(keyName)

        return isBlackKey ? this.widthBlackKey : this.widthWhiteKey / 4
    }

    getXPositionKey = (keyName: AlphabeticalNote) => {
        const key = noteToKey(keyName)
        const previousKeys = NOTE_NAMES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
        const previousWhiteKeys = previousKeys.filter((note) => !Keyboard.isBlackKey(note))
        const nbPreviousWhiteKeys = previousWhiteKeys.length
        const margin = this.getMarginKey(keyName)

        return nbPreviousWhiteKeys * this.widthWhiteKey - margin
    }

    getKeyStyles = (keyName: AlphabeticalNote) => {
        return {
            x: this.getXPositionKey(keyName),
            margin: this.getMarginKey(keyName),
            width: this.getWidthKey(keyName),
        }
    }

}
