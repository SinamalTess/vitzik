import React, { useEffect, useRef, useState } from 'react'
import './Piano.scss'
import { NOTES, NB_WHITE_PIANO_KEYS } from '../utils/const'
import { AlphabeticalNote, MusicSystem } from '../types'
import Soundfont from 'soundfont-player'
import {
    isSpecialKey as checkIsSpecialKey,
    msToSec,
    normalizeVelocity,
    noteToKey,
    translateNote,
} from '../utils'
import { ActiveNote } from '../App'
import { usePrevious } from '../hooks'

interface PianoProps {
    activeKeys: ActiveNote[]
    isMute: boolean
    musicSystem: MusicSystem
    trackPosition: number
    onKeyPressed: (note: ActiveNote[]) => void
}

export function Piano({
    activeKeys,
    isMute,
    musicSystem,
    trackPosition,
    onKeyPressed,
}: PianoProps) {
    const keys = NOTES.alphabetical
    const [instrument, setInstrument] = useState<Soundfont.Player | null>(null)
    const notesAlreadyPlayed: React.MutableRefObject<any[]> = useRef([])
    const prevTrackPosition = usePrevious(trackPosition)

    useEffect(() => {
        Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano').then(
            (piano) => {
                setInstrument(piano)
            },
            () => {
                console.error('Failed to start the piano audio')
            }
        )
    }, [])

    useEffect(() => {
        if (!isMute && activeKeys.length) {
            activeKeys.forEach((note) => {
                const { velocity, id, duration, key } = note
                const gain = normalizeVelocity(0, 1, velocity)
                if (!notesAlreadyPlayed.current.find((note) => note.id === id)) {
                    instrument?.play(key.toString(), undefined, {
                        gain,
                        duration: msToSec(duration ?? 0),
                    })
                    notesAlreadyPlayed.current.push(note)
                }
            })
        }
    }, [activeKeys])

    useEffect(() => {
        if (prevTrackPosition && prevTrackPosition >= trackPosition) {
            notesAlreadyPlayed.current = []
        }
    }, [trackPosition])

    function handleMouseDown(note: AlphabeticalNote) {
        onKeyPressed([
            {
                name: note,
                velocity: 100,
                key: noteToKey(note),
            },
        ])
    }

    function handleMouseUp() {
        onKeyPressed([])
    }

    return (
        <ul className="piano">
            {keys.map((key, index) => {
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
