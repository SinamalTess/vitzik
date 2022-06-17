import React from 'react'
import './Keyboard.scss'
import { NOTES } from '../utils/const'
import { AlphabeticalNote, MusicSystem } from '../types'
import {
    getWidthKeys,
    isSpecialNote as checkIsSpecialNote,
    noteToKey,
    translateNoteToMusicSystem,
} from '../utils'
import { ActiveNote } from '../App'

interface PianoProps {
    activeKeys: ActiveNote[]
    musicSystem: MusicSystem
    onKeyPressed: (note: ActiveNote[]) => void
}

function getStyles(note: AlphabeticalNote) {
    const isBlackKey = note.includes('#')
    const isSpecialNote = checkIsSpecialNote(note)
    const { widthWhiteKey, widthBlackKey } = getWidthKeys(100)
    const margin = isBlackKey || !isSpecialNote ? `0 0 0 -${widthWhiteKey / 4}%` : '0'
    const width = isBlackKey ? `${widthBlackKey}%` : `${widthWhiteKey}%`

    return {
        margin,
        width,
    }
}

export const Keyboard = React.memo(function Keyboard({
    activeKeys,
    musicSystem,
    onKeyPressed,
}: PianoProps) {
    const notes = NOTES.alphabetical

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
            {notes.map((note) => {
                const isBlackKey = note.includes('#')
                const isActive = activeKeys.find((currentKey) => currentKey.name === note)
                const styleKeyName = isActive ? { display: 'block' } : {}
                const keyTranslated =
                    musicSystem !== 'alphabetical'
                        ? translateNoteToMusicSystem(note, musicSystem)
                        : note
                const keyClassName = isBlackKey ? 'keyboard__blackkey' : 'keyboard__whitekey'
                const { width, margin } = getStyles(note)

                return (
                    <li
                        key={note}
                        style={{ width, margin }}
                        onMouseDown={() => handleMouseDown(note)}
                        onMouseUp={handleMouseUp}
                        className={`
                            ${keyClassName} 
                            ${noteToKey(note)} 
                            ${note} ${isActive ? `${keyClassName}--active` : ''}`}
                    >
                        <span style={styleKeyName}>{keyTranslated}</span>
                    </li>
                )
            })}
        </ul>
    )
})
