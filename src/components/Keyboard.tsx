import React, { useEffect, useRef, useState } from 'react'
import './Keyboard.scss'
import { NOTES, NB_WHITE_PIANO_KEYS } from '../utils/const'
import { AlphabeticalNote, Instrument, MusicSystem } from '../types'
import Soundfont from 'soundfont-player'
import {
    isSpecialKey as checkIsSpecialKey,
    msToSec,
    normalizeInstrumentName,
    normalizeVelocity,
    noteToKey,
    translateNote,
} from '../utils'
import { ActiveNote } from '../App'
import { AudioPlayerState } from './AudioPlayer'

interface PianoProps {
    activeKeys: ActiveNote[]
    isMute: boolean
    musicSystem: MusicSystem
    instrument: Instrument
    onKeyPressed: (note: ActiveNote[]) => void
    audioPlayerState: AudioPlayerState
}

export function Keyboard({
    activeKeys,
    isMute,
    musicSystem,
    instrument,
    onKeyPressed,
    audioPlayerState,
}: PianoProps) {
    const keys = NOTES.alphabetical
    const [instrumentPlayer, setInstrumentPlayer] = useState<Soundfont.Player | null>(null)
    const notesAlreadyPlayed: React.MutableRefObject<any[]> = useRef([])

    useEffect(() => {
        const ac = new AudioContext()
        const SoundfontInstrument = normalizeInstrumentName(instrument)
        Soundfont.instrument(ac, SoundfontInstrument, { soundfont: 'FluidR3_GM' })
            .then((instrumentPlayer) => {
                setInstrumentPlayer(instrumentPlayer)
            })
            .catch((error) => {
                console.error(`Failed to start the piano audio ${error}`)
            })
        return () => {
            ac.close()
        }
    }, [instrument])

    useEffect(() => {
        if (!isMute && activeKeys.length) {
            activeKeys.forEach((note) => {
                const { velocity, id, duration, key } = note
                const gain = normalizeVelocity(0, 1, velocity)
                if (!notesAlreadyPlayed.current.find((note) => note.id === id)) {
                    instrumentPlayer?.play(key.toString(), undefined, {
                        gain,
                        duration: msToSec(duration ?? 0),
                    })
                    notesAlreadyPlayed.current.push(note)
                }
            })
        }
    }, [activeKeys])

    useEffect(() => {
        if (audioPlayerState === 'rewinding') {
            notesAlreadyPlayed.current = []
        }
    }, [audioPlayerState])

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
        <ul className="keyboard">
            {keys.map((key, index) => {
                const isBlackKey = key.includes('#')
                const isSpecialKey = checkIsSpecialKey(key)
                const keyClassName = isBlackKey ? 'keyboard__blackkey' : 'keyboard__whitekey'
                const widthWhiteKey = 100 / NB_WHITE_PIANO_KEYS
                const margin = isBlackKey || !isSpecialKey ? `0 0 0 -${widthWhiteKey / 4}%` : '0'
                const width = isBlackKey ? `${widthWhiteKey / 2}%` : `${widthWhiteKey}%`
                const isActive = activeKeys.find((currentKey) => currentKey.name === key)
                const styleKeyName = isActive ? { display: 'block' } : {}
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
                            ${key} ${isActive ? `${keyClassName}--active` : ''}`}
                    >
                        <span style={styleKeyName}>{keyTranslated}</span>
                    </li>
                )
            })}
        </ul>
    )
}
