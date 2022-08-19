import React from 'react'
import './Keyboard.scss'
import {
    ActiveNote,
    AlphabeticalNote,
    MidiInputActiveNote,
    MidiMode,
    MidiVisualizerActiveNote,
    MusicSystem,
} from '../../types'
import { translateNoteTo } from '../../utils'
import clsx from 'clsx'
import findLast from 'lodash/findLast'
import last from 'lodash/last'
import { KeyboardFactory } from './KeyboardFactory'

interface KeyboardProps {
    activeNotes: ActiveNote[]
    musicSystem?: MusicSystem
    midiMode: MidiMode
    onChangeActiveNotes: (note: MidiInputActiveNote[]) => void
    onAllMidiKeysPlayed?: () => void
    showNotes?: boolean
}

const keyboardFactory = new KeyboardFactory(100)

const KEYBOARD_KEYS = keyboardFactory.getKeys()

const BASE_CLASS = 'keyboard'

function getKeyStyles(keyName: AlphabeticalNote) {
    const isBlackKey = KeyboardFactory.isBlackKey(keyName)
    const isSpecialKey = KeyboardFactory.isSpecialKey(keyName)
    const { widthWhiteKey, widthBlackKey } = KeyboardFactory.getWidthKeys(100)
    const margin = isBlackKey || !isSpecialKey ? `0 0 0 -${widthWhiteKey / 4}%` : '0'
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
    onChangeActiveNotes,
    onAllMidiKeysPlayed,
    showNotes = true,
}: KeyboardProps) {
    function handleTouchStart(note: MidiInputActiveNote) {
        onChangeActiveNotes([...activeNotes, note])
    }

    function handleTouchEnd(note: MidiInputActiveNote) {
        setActiveNotes(note)
    }

    function handleMouseDown(note: MidiInputActiveNote) {
        onChangeActiveNotes([...activeNotes, note])
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
        setActiveNotes(note)
    }

    function setActiveNotes(note: MidiInputActiveNote) {
        const { name, channel } = note
        const midiActiveNotes = activeNotes.filter(
            (activeNote) => activeNote.name === name && activeNote.channel !== channel
        )
        /*
           We don't want to remove all the activeNotes from the midi file with the same name.
           Sometimes the same note is hit at the same time but on different channels.
           We only remove the last note found and this is on purpose.
       */
        const lastMidiNote = last(midiActiveNotes)

        if (lastMidiNote) {
            const newActiveNotes = removeActiveNotes([note, lastMidiNote])
            if (midiMode === 'wait') {
                const isAllNotesPlayed = newActiveNotes.length === 0
                if (isAllNotesPlayed && onAllMidiKeysPlayed) {
                    onChangeActiveNotes(newActiveNotes)
                    onAllMidiKeysPlayed()
                }
            } else {
                onChangeActiveNotes(removeActiveNotes([note]))
            }
        } else {
            const newActiveNotes = removeActiveNotes([note])
            const isAllNotesPlayed = newActiveNotes.length === 0
            if (isAllNotesPlayed && onAllMidiKeysPlayed) {
                onAllMidiKeysPlayed()
            }
            onChangeActiveNotes(newActiveNotes)
        }
    }

    function removeActiveNotes(notesToBeRemoved: ActiveNote[]) {
        return activeNotes.filter(
            (activeNote) =>
                !notesToBeRemoved.some(({ channel, name }) => {
                    const isSameChannel = channel === activeNote.channel
                    const isSameName = name === activeNote.name
                    return isSameChannel && isSameName
                })
        )
    }

    function handleDragStart(e: React.DragEvent<HTMLLIElement>) {
        e.preventDefault()
    }

    function findActiveKey(keyName: AlphabeticalNote) {
        /*
            Sometimes multiple instruments will play the same note at the same time, but we can only paint one color.
            So we pick the last active key because this is the one on top in the Visualizer.
        */
        return findLast(
            activeNotes,
            (activeKey) => activeKey.name === keyName
        ) as MidiVisualizerActiveNote
    }

    return (
        <ul className={BASE_CLASS}>
            {KEYBOARD_KEYS.map((key) => {
                const { name } = key
                const { width, margin } = getKeyStyles(name)
                const activeKey = findActiveKey(name)
                const isActive = Boolean(activeKey)
                const styleKeyName = isActive ? { display: 'block' } : {}
                const shouldTranslateKey = musicSystem !== 'alphabetical' && showNotes
                const keyName = shouldTranslateKey ? translateNoteTo(name, musicSystem) : name
                const isBlackKey = KeyboardFactory.isBlackKey(name)
                const keyClass = isBlackKey ? 'blackkey' : 'whitekey'
                const classNames = clsx(
                    [`${BASE_CLASS}__${keyClass}`],
                    { [`${BASE_CLASS}__${keyClass}--active`]: isActive },
                    { [`channel--${activeKey?.channel}`]: isActive }
                )
                const dataTestId = `${name}${isActive ? '-active' : ''}`

                return (
                    <li
                        key={name}
                        style={{
                            width,
                            margin,
                        }}
                        data-testid={dataTestId}
                        className={classNames}
                        onMouseDown={() => handleMouseDown(key)}
                        onTouchStart={() => handleTouchStart(key)}
                        onTouchEnd={() => handleTouchEnd(key)}
                        onDragStart={handleDragStart}
                    >
                        {showNotes ? <span style={styleKeyName}>{keyName}</span> : null}
                    </li>
                )
            })}
        </ul>
    )
}
