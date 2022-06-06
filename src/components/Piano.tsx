import React, { useState } from 'react'
import './Piano.scss'
import { NOTES, NB_WHITE_PIANO_KEYS } from '../utils/const'
import { AlphabeticalNote } from '../types'
import Soundfont from 'soundfont-player'
import { isSpecialKey as checkIsSpecialKey, noteToKey } from '../utils'

interface PianoProps {
    activeKeys: AlphabeticalNote[]
    startingKey?: AlphabeticalNote
    onKeyPressed: (key: AlphabeticalNote[]) => void
    isMute: boolean
}

export function Piano({ activeKeys, onKeyPressed, isMute }: PianoProps) {
    const keysIterator = NOTES.alphabetical

    const [instrument, setInstrument] = useState<Soundfont.Player | null>(null)

    React.useEffect(() => {
        Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano').then(
            (piano) => {
                setInstrument(piano)
            },
            () => {
                console.error('Failed to start the piano audio')
            }
        )
    }, [])

    React.useEffect(() => {
        instrument?.on('play', (e) => console.log(e))
        if (!isMute && activeKeys.length >= 1) {
            activeKeys.forEach(() => {
                instrument?.play(formatKey(activeKeys))
            })
        }
    }, [activeKeys])

    function formatKey(keys: AlphabeticalNote[]) {
        let note = keys[0]
        return note.includes('#') ? note.split('/')[1] : note
    }

    return (
        <ul className="piano">
            {keysIterator.map((key, index) => {
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
                            ${key} ${noteToKey(key)} ${
                            activeKeys.includes(key) ? `${keyClassName}--active` : ''
                        }`}
                    >
                        <span style={styleKeyName}>{key}</span>
                    </li>
                )
            })}
        </ul>
    )
}
