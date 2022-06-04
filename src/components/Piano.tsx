import React from 'react'
import './Piano.scss'
import { NOTES, NB_WHITE_PIANO_KEYS } from '../utils/const'
import { AlphabeticalNote } from '../types'
import Soundfont from 'soundfont-player'
import { isSpecialKey as checkIsSpecialKey } from '../utils'

interface PianoProps {
    activeKeys: AlphabeticalNote[]
    startingKey?: AlphabeticalNote
    onKeyPressed: (key: AlphabeticalNote[]) => void
    isMute: boolean
}

export function Piano({ activeKeys, onKeyPressed, isMute }: PianoProps) {
    const keysIterator = NOTES.alphabetical

    React.useEffect(() => {
        if (!isMute && activeKeys.length >= 1) {
            Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano').then(function (piano) {
                let note: string = activeKeys[0]
                note = note.includes('#') ? note.split('/')[1] : note
                piano.play(note)
            })
        }
    }, [activeKeys])

    return (
        <ul className="piano">
            {keysIterator.map((key) => {
                const isBlackKey = key.includes('#')
                const isSpecialKey = checkIsSpecialKey(key)
                const keyClassName = isBlackKey ? 'piano__blackkey' : 'piano__whitekey'
                const margin =
                    isBlackKey || !isSpecialKey ? `0 0 0 -${100 / NB_WHITE_PIANO_KEYS / 4}%` : '0'
                const widthWhiteKey = 100 / NB_WHITE_PIANO_KEYS
                const width = isBlackKey ? `${widthWhiteKey / 2}%` : `${widthWhiteKey}%`
                const styleKeyName = activeKeys.includes(key) ? { display: 'block' } : {}

                return (
                    <li
                        key={key}
                        style={{ width, margin }}
                        onMouseDown={() => onKeyPressed([key])}
                        onMouseUp={() => onKeyPressed([])}
                        className={`
                            ${keyClassName} 
                            ${key} ${activeKeys.includes(key) ? `${keyClassName}--active` : ''}`}
                    >
                        <span style={styleKeyName}>{key}</span>
                    </li>
                )
            })}
        </ul>
    )
}
