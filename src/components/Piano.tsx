import React, { useState } from 'react'
import './Piano.scss'
import { NOTES, NB_WHITE_PIANO_KEYS } from '../utils/const'
import { AlphabeticalNote, MusicSystem } from '../types'
import Soundfont from 'soundfont-player'
import { isSpecialKey as checkIsSpecialKey, noteToKey, translateNote } from '../utils'
import { ActiveNote } from '../App'

interface PianoProps {
    activeKeys: ActiveNote[]
    startingKey?: AlphabeticalNote
    isMute: boolean
    onKeyPressed: (note: ActiveNote[]) => void
    musicSystem: MusicSystem
}

export function Piano({ activeKeys, onKeyPressed, isMute, musicSystem }: PianoProps) {
    const keysIterator = NOTES.alphabetical

    const [instrument, setInstrument] = useState<Soundfont.Player | null>(null)
    const normalizeVelocity = (val: number, max: number, min: number) => (val - min) / (max - min)

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
        //TODO: review naming
        if (!isMute && activeKeys.length >= 1) {
            activeKeys.forEach((activeKey) => {
                const gain = normalizeVelocity(1, 127, activeKey.velocity)
                instrument?.play(formatKey(activeKey.name), undefined, { gain })
            })
        }
    }, [activeKeys])

    function formatKey(key: AlphabeticalNote): string {
        return key.includes('#') ? key.split('/')[1] : key
    }

    function handleMouseDown(note: AlphabeticalNote) {
        onKeyPressed([
            {
                name: note,
                velocity: 100,
            },
        ])
    }

    function handleMouseUp() {
        onKeyPressed([])
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
                const styleKeyName = activeKeys.find((currentKey) => currentKey.name === key)
                    ? { display: 'block' }
                    : {}
                const keyTranslated =
                    musicSystem !== 'alphabetical' ? translateNote(key, musicSystem) : key

                return (
                    <li
                        key={key}
                        style={{ width, margin }}
                        onMouseDown={() => handleMouseDown(key)}
                        onMouseUp={handleMouseUp}
                        className={`
                            ${keyClassName} 
                            ${key} ${noteToKey(key)} ${
                            activeKeys.find((currentKey) => currentKey.name === key)
                                ? `${keyClassName}--active`
                                : ''
                        }`}
                    >
                        <span style={styleKeyName}>{keyTranslated}</span>
                    </li>
                )
            })}
        </ul>
    )
}
