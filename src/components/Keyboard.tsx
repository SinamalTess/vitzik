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

interface KeyboardProps {
    activeKeys: ActiveNote[]
    musicSystem?: MusicSystem
    onKeyPressed: (note: ActiveNote[]) => void
}

interface KeyboardNote {
    name: AlphabeticalNote
    velocity: number
    key: number
    channel: number
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

function removeNotesFromActiveKeys(
    activeKeys: ActiveNote[],
    notes: { name: AlphabeticalNote; channel: number }[]
) {
    const activeKeysCopy = [...activeKeys]
    notes.forEach(({ channel, name }) => {
        const noteIndex = activeKeysCopy.findIndex(
            (activeKey) => activeKey.name === name && activeKey.channel === channel
        )
        if (noteIndex >= 0) {
            activeKeysCopy.splice(noteIndex, 1)
        }
    })
    return activeKeysCopy
}

export const Keyboard = React.memo(function Keyboard({
    activeKeys,
    musicSystem = 'alphabetical',
    onKeyPressed,
}: KeyboardProps) {
    const activeKeysReversed = [...activeKeys].reverse()
    const keyboardChannel = 16
    const keyboardVelocity = 100
    const notes = NOTES.alphabetical.map((noteName) => ({
        name: noteName,
        velocity: keyboardVelocity,
        key: noteToKey(noteName),
        channel: keyboardChannel,
    }))

    function addNoteToActiveKeys(note: KeyboardNote) {
        return [...activeKeys, note]
    }

    function handleMouseDown(note: KeyboardNote) {
        const activeKeysCopy = addNoteToActiveKeys(note)
        onKeyPressed(activeKeysCopy)
    }

    function handleMouseUp(note: KeyboardNote) {
        const { name, channel } = note
        const isNoteFoundInMidi = activeKeys.find(
            (activeKey) => activeKey.name === name && activeKey.channel !== channel
        )
        if (isNoteFoundInMidi?.name) {
            const activeKeysCopy = removeNotesFromActiveKeys(activeKeys, [
                { name, channel },
                { name: isNoteFoundInMidi.name, channel: isNoteFoundInMidi.channel },
            ])
            onKeyPressed(activeKeysCopy)
        } else {
            const activeKeysCopy = removeNotesFromActiveKeys(activeKeys, [{ name, channel }])
            onKeyPressed(activeKeysCopy)
        }
    }

    return (
        <ul className="keyboard">
            {notes.map((note) => {
                const { name } = note
                const isBlackKey = name.includes('#')
                /*
                    Sometimes multiple instruments will play the same note at the same time, but we can only paint one color.
                    So we pick the last active key because this is the one on top in the Visualizer.
                */
                const lastActiveKey = activeKeysReversed.find(
                    (currentKey) => currentKey.name === name
                )
                const isActive = Boolean(lastActiveKey)
                const styleKeyName = isActive ? { display: 'block' } : {}
                const keyTranslated =
                    musicSystem !== 'alphabetical'
                        ? translateNoteToMusicSystem(name, musicSystem)
                        : name
                const { width, margin } = getStyles(name)
                const className = clsx(
                    { ['keyboard__blackkey']: isBlackKey },
                    { ['keyboard__whitekey']: !isBlackKey },
                    { [`keyboard__blackkey--active`]: isActive && isBlackKey },
                    { [`keyboard__whitekey--active`]: isActive && !isBlackKey },
                    [`${noteToKey(name)}`],
                    [`${name}`]
                )

                return (
                    <li
                        key={name}
                        style={{
                            width,
                            margin,
                            background: lastActiveKey ? CHANNElS_COLORS[lastActiveKey.channel] : '',
                        }}
                        data-testid={name}
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
