import React from 'react'
import './piano.scss'
import { NOTES, NB_WHITE_PIANO_KEYS } from '../../utils/const'
import { AlphabeticalNote } from '../../types'
import Soundfont from 'soundfont-player'

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
            Soundfont.instrument(
                new AudioContext(),
                'acoustic_grand_piano'
            ).then(function (piano) {
                let note: string = activeKeys[0]
                note = note.includes('#') ? note.split('/')[1] : note
                piano.play(note)
            })
        }
    }, [activeKeys])

    return (
        <ul className="set">
            {keysIterator.map((key, index) => {
                const isBlackKey = key.includes('#')
                const isSpecialKey = key.includes('C') || key.includes('F')

                return (
                    <li
                        key={key}
                        style={{
                            width: isBlackKey
                                ? 100 / NB_WHITE_PIANO_KEYS / 2 + '%' // black keys are twice smaller in width
                                : 100 / NB_WHITE_PIANO_KEYS + '%',
                            margin:
                                isBlackKey || !isSpecialKey
                                    ? `0 0 0 -${
                                          100 / NB_WHITE_PIANO_KEYS / 4 + '%'
                                      }`
                                    : `0 0 0 0`,
                        }}
                        onMouseDown={() => onKeyPressed([key])}
                        onMouseUp={() => onKeyPressed([])}
                        className={`
                            ${isBlackKey ? 'black' : 'white'} 
                            ${key} ${activeKeys.includes(key) ? 'active' : ''}`}
                    >
                        <span
                            style={
                                activeKeys.includes(key)
                                    ? { display: 'block' }
                                    : {}
                            }
                        >
                            {key}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}
