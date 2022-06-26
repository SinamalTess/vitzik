import React from 'react'
import './Keyboard.scss'
import { NOTES } from '../utils/const'
import { AlphabeticalNote, MusicSystem, ActiveNote } from '../types'
import {
    getWidthKeys,
    isSpecialNote as checkIsSpecialNote,
    noteToKey,
    translateNoteToMusicSystem,
} from '../utils'
import clsx from 'clsx'
import { CHANNElS_COLORS } from '../utils/const/channel_colors'

interface PianoProps {
    activeKeys: ActiveNote[]
    musicSystem?: MusicSystem
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
    musicSystem = 'alphabetical',
    onKeyPressed,
}: PianoProps) {
    const notes = NOTES.alphabetical
    const activeKeysReversed = [...activeKeys].reverse()

    function handleMouseDown(note: AlphabeticalNote) {
        onKeyPressed([
            ...activeKeys,
            {
                name: note,
                velocity: 100,
                key: noteToKey(note),
                channel: 16,
            },
        ])
    }

    function handleMouseUp(note: AlphabeticalNote) {
        const activeKeysCopy = [...activeKeys]
        const noteIndex = activeKeysCopy.findIndex(
            (activeKey) => activeKey.name === note && activeKey.channel === 16
        )
        if (noteIndex) {
            activeKeysCopy.splice(noteIndex, 1)
            onKeyPressed(activeKeysCopy)
        }
    }

    return (
        <ul className="keyboard">
            {notes.map((note) => {
                const isBlackKey = note.includes('#')
                /*
                    Sometimes multiple instruments will play the same note at the same time, but we can only paint one color.
                    So we pick the last active key because this is the one on top in the Visualizer.
                */
                const lastActiveKey = activeKeysReversed.find(
                    (currentKey) => currentKey.name === note
                )
                const isActive = Boolean(lastActiveKey)
                const styleKeyName = isActive ? { display: 'block' } : {}
                const keyTranslated =
                    musicSystem !== 'alphabetical'
                        ? translateNoteToMusicSystem(note, musicSystem)
                        : note
                const { width, margin } = getStyles(note)
                const className = clsx(
                    { ['keyboard__blackkey']: isBlackKey },
                    { ['keyboard__whitekey']: !isBlackKey },
                    { [`keyboard__blackkey--active`]: isActive && isBlackKey },
                    { [`keyboard__whitekey--active`]: isActive && !isBlackKey },
                    [`${noteToKey(note)}`],
                    [`${note}`]
                )

                return (
                    <li
                        key={note}
                        style={{
                            width,
                            margin,
                            background: lastActiveKey ? CHANNElS_COLORS[lastActiveKey.channel] : '',
                        }}
                        data-testid={note}
                        className={className}
                        onMouseDown={() => handleMouseDown(note)}
                        onMouseUp={() => handleMouseUp(note)}
                    >
                        <span style={styleKeyName}>{keyTranslated}</span>
                    </li>
                )
            })}
        </ul>
    )
})
