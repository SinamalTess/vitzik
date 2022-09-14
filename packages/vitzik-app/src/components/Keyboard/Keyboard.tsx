import React from 'react'
import './Keyboard.scss'
import {
    ActiveNote,
    AlphabeticalNote,
    MidiInputActiveNote,
    MidiPlayMode,
    MidiVisualizerActiveNote,
    MusicSystem,
} from '../../types'
import { translateNoteTo } from '../../utils'
import clsx from 'clsx'
import findLast from 'lodash/findLast'
import last from 'lodash/last'
import { Keyboard as KeyboardClass } from '../../utils/Keyboard'

interface KeyboardProps {
    activeNotes: ActiveNote[]
    musicSystem?: MusicSystem
    midiPlayMode: MidiPlayMode
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onAllMidiKeysPlayed?: () => void
    showNotes?: boolean
}

const keyboardFactory = new KeyboardClass(100, 100)

const KEYBOARD_KEYS = keyboardFactory.getKeys()

const BASE_CLASS = 'keyboard'

function getKeyStyles(keyName: AlphabeticalNote) {
    const isBlackKey = KeyboardClass.isBlackKey(keyName)
    const isSpecialKey = KeyboardClass.isSpecialKey(keyName)
    const { widthWhiteKey } = keyboardFactory.getWidthKeys()
    const margin = isBlackKey || !isSpecialKey ? `0 0 0 -${widthWhiteKey / 4}%` : '0'
    const width = `${keyboardFactory.getWidthKey(keyName)}%`

    return {
        margin,
        width,
    }
}

export function Keyboard({
    activeNotes,
    musicSystem = 'alphabetical',
    midiPlayMode,
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
        onChangeActiveNotes((activeNotes) => [...activeNotes, note])
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
        const lastMidiActiveNote = last(midiActiveNotes)
        if (lastMidiActiveNote) {

            if (midiPlayMode === 'waitForValidInput') {
                const newActiveNotes = removeActiveNotes([note, lastMidiActiveNote])
                const allNotesHaveBeenPlayed = newActiveNotes.length === 0

                if (allNotesHaveBeenPlayed) {
                    onAllMidiKeysPlayed?.()
                    onChangeActiveNotes(newActiveNotes)
                } else {
                    const newActiveNotes = removeActiveNotes([note])
                    onChangeActiveNotes(newActiveNotes)
                }

            } else {
                const newActiveNotes = removeActiveNotes([note])
                onChangeActiveNotes(newActiveNotes)
            }
        } else {
            const newActiveNotes = removeActiveNotes([note])
            const allNotesHaveBeenPlayed = newActiveNotes.length === 0

            if (allNotesHaveBeenPlayed) {
                onAllMidiKeysPlayed?.()
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
                const isBlackKey = KeyboardClass.isBlackKey(name)
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
