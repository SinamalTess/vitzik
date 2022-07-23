import React from 'react'
import './Keyboard.scss'
import { KEYBOARD_CHANNEL, NOTE_NAMES } from '../../utils/const'
import {
    AlphabeticalNote,
    MusicSystem,
    ActiveNote,
    MidiInputActiveNote,
    MidiVisualizerActiveNote,
    MidiMode,
} from '../../types'
import {
    getWidthKeys,
    isSpecialNote as checkIsSpecialNote,
    isBlackKey as checkIsBlackKey,
    noteToKey,
    removeNotesFromActiveNotes,
    translateNoteToMusicSystem,
} from '../../utils'
import clsx from 'clsx'
import { MIDI_CHANNEL_COLORS } from '../../utils/const'
import { findLast, last } from 'lodash'

interface KeyboardProps {
    activeNotes: ActiveNote[]
    musicSystem?: MusicSystem
    midiMode: MidiMode
    onKeyPressed: (note: MidiInputActiveNote[]) => void
    onAllMidiKeysPlayed?: () => void
}

const KEYBOARD_VELOCITY = 100

const NOTES = NOTE_NAMES.alphabetical.map((noteName) => ({
    name: noteName,
    velocity: KEYBOARD_VELOCITY,
    key: noteToKey(noteName),
    channel: KEYBOARD_CHANNEL,
}))

const BASE_CLASS = 'keyboard'

function getKeys(activeNotes: ActiveNote[], musicSystem: MusicSystem) {
    return NOTES.map((note) => {
        const { name } = note
        const isBlackKey = checkIsBlackKey(name)
        /*
            Sometimes multiple instruments will play the same note at the same time, but we can only paint one color.
            So we pick the last active key because this is the one on top in the Visualizer.
        */
        const lastActiveKey = findLast(
            activeNotes,
            (activeKey) => activeKey.name === name
        ) as MidiVisualizerActiveNote

        const isActive = Boolean(lastActiveKey)
        const styleKeyName = isActive ? { display: 'block' } : {}
        const keyTranslated =
            musicSystem !== 'alphabetical' ? translateNoteToMusicSystem(name, musicSystem) : name
        const { width, margin } = getStyles(name)
        const background = isActive ? MIDI_CHANNEL_COLORS[lastActiveKey.channel] : ''
        const classNames = clsx(
            { [`${BASE_CLASS}__blackkey`]: isBlackKey },
            { [`${BASE_CLASS}__whitekey`]: !isBlackKey },
            { [`${BASE_CLASS}__blackkey--active`]: isActive && isBlackKey },
            { [`${BASE_CLASS}__whitekey--active`]: isActive && !isBlackKey },
            [`${name}`]
        )

        return {
            note,
            styleKeyName,
            keyTranslated,
            classNames,
            name,
            width,
            margin,
            background,
        }
    })
}

function getStyles(note: AlphabeticalNote) {
    const isBlackKey = checkIsBlackKey(note)
    const isSpecialNote = checkIsSpecialNote(note)
    const { widthWhiteKey, widthBlackKey } = getWidthKeys(100)
    const margin = isBlackKey || !isSpecialNote ? `0 0 0 -${widthWhiteKey / 4}%` : '0'
    const width = isBlackKey ? `${widthBlackKey}%` : `${widthWhiteKey}%`

    return {
        margin,
        width,
    }
}

export function Keyboard({
    activeNotes,
    musicSystem = 'alphabetical',
    midiMode,
    onKeyPressed,
    onAllMidiKeysPlayed,
}: KeyboardProps) {
    const keys = getKeys(activeNotes, musicSystem)

    function addNoteToActiveKeys(note: MidiInputActiveNote) {
        return [...activeNotes, note]
    }

    function handleMouseDown(note: MidiInputActiveNote) {
        const activeKeysCopy = addNoteToActiveKeys(note)
        onKeyPressed(activeKeysCopy)
        /*
           When using onMouseDown prop, handleMouseUp() would not fire when the click was released
           outside the element, leaving the key active after it was clicked.
       */
        document.addEventListener(
            'mouseup',
            () => {
                handleMouseUp(note)
            },
            { once: true } // fires only once and then removes automatically the listener.
        )
    }

    function handleMouseUp(note: MidiInputActiveNote) {
        const { name, channel } = note
        const midiActiveNotes = activeNotes.filter(
            (activeKey) => activeKey.name === name && activeKey.channel !== channel
        )
        /*
           We don't want to remove all the activeNotes from the midi file with the same name.
           Sometimes the same note is hit at the same time but on different channels.
           We only remove the last note found and this is on purpose.
       */
        const lastMidiNote = last(midiActiveNotes)

        if (lastMidiNote) {
            const activeKeysCopy = removeNotesFromActiveNotes(activeNotes, [note, lastMidiNote])
            const isAllNotesPlayed = activeKeysCopy.length === 0
            if (isAllNotesPlayed && onAllMidiKeysPlayed && midiMode === 'wait') {
                onKeyPressed(activeKeysCopy)
                onAllMidiKeysPlayed()
            } else {
                onKeyPressed(removeNotesFromActiveNotes(activeNotes, [note]))
            }
        } else {
            const activeKeysCopy = removeNotesFromActiveNotes(activeNotes, [note])
            const isAllNotesPlayed = activeKeysCopy.length === 0
            if (isAllNotesPlayed && onAllMidiKeysPlayed) {
                onAllMidiKeysPlayed()
            }
            onKeyPressed(activeKeysCopy)
        }
    }

    // Prevent
    function handleDragStart(e: React.DragEvent<HTMLLIElement>) {
        e.preventDefault()
    }

    return (
        <ul className={BASE_CLASS}>
            {keys.map((key) => {
                const {
                    name,
                    width,
                    margin,
                    background,
                    classNames,
                    styleKeyName,
                    keyTranslated,
                    note,
                } = key
                return (
                    <li
                        key={name}
                        style={{
                            width,
                            margin,
                            background,
                        }}
                        data-testid={name}
                        className={classNames}
                        onMouseDown={() => handleMouseDown(note)}
                        onDragStart={handleDragStart}
                    >
                        <span style={styleKeyName}>{keyTranslated}</span>
                    </li>
                )
            })}
        </ul>
    )
}
