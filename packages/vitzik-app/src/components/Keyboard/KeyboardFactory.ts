import { KEYBOARD_CHANNEL, NB_WHITE_PIANO_KEYS, NOTE_NAMES } from '../../utils/const'
import { noteToKey } from '../../utils'
import { ActiveNote, AlphabeticalNote } from '../../types'

export class KeyboardFactory {
    velocity: number
    widthWhiteKey: number
    widthBlackKey: number
    activeKeys: ActiveNote[]

    constructor(velocity: number) {
        this.velocity = velocity
        this.activeKeys = []
        this.widthWhiteKey = 100 / NB_WHITE_PIANO_KEYS
        this.widthBlackKey = 100 / NB_WHITE_PIANO_KEYS / 2
    }

    getKeys() {
        return NOTE_NAMES.alphabetical.map((noteName) => ({
            name: noteName,
            velocity: this.velocity,
            key: noteToKey(noteName),
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

    static getWidthKeys = (
        widthContainer: number
    ): { widthWhiteKey: number; widthBlackKey: number } => {
        const widthWhiteKey = widthContainer / NB_WHITE_PIANO_KEYS
        return {
            widthWhiteKey,
            widthBlackKey: widthWhiteKey / 2,
        }
    }
}
