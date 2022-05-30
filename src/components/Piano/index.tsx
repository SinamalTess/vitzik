import React from 'react'
import './piano.scss'
import { NOTES } from '../../utils/const/notes'
import { AlphabeticalNote, Note } from '../../types/Notes'

interface PianoProps {
    activeKeys: AlphabeticalNote[]
    startingKey?: AlphabeticalNote
    nbKey?: number
    onKeyPressed: (key: AlphabeticalNote[]) => void
}

export function Piano({
    activeKeys,
    startingKey = 'A0',
    nbKey = 88,
    onKeyPressed,
}: PianoProps) {
    const startingKeyIndex = NOTES.alphabetical.findIndex(
        (note) => note === startingKey
    )
    const keysIterator = NOTES.alphabetical.slice(startingKeyIndex, nbKey)
    const nbWhiteKeys = keysIterator.filter((key) => !key.includes('#')).length

    return (
        <>
            <ul className="set">
                {keysIterator.map((key, index) => {
                    const isBlackKey = key.includes('#')
                    const isSpecialKey = key.includes('C') || key.includes('F')

                    return (
                        <li
                            key={key}
                            style={{
                                width: isBlackKey
                                    ? 100 / nbWhiteKeys / 2 + '%' // black keys are twice smaller in width
                                    : 100 / nbWhiteKeys + '%',
                                margin:
                                    isBlackKey || !isSpecialKey
                                        ? `0 0 0 -${
                                              100 / nbWhiteKeys / 4 + '%'
                                          }`
                                        : `0 0 0 0`,
                            }}
                            onMouseDown={() => onKeyPressed([key])}
                            onMouseUp={() => onKeyPressed([])}
                            className={`
                                ${isBlackKey ? 'black' : 'white'} 
                                ${key} ${
                                activeKeys.includes(key) ? 'active' : ''
                            }`}
                        ></li>
                    )
                })}
            </ul>
        </>
    )
}
