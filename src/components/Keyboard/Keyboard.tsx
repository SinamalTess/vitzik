import React from 'react'
import './Keyboard.scss'
import { NOTE_NAMES } from '../../utils/const'
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
    removeNotesFromActiveKeys,
    translateNoteToMusicSystem,
} from '../../utils'
import clsx from 'clsx'
import { MIDI_CHANNEL_COLORS } from '../../utils/const'

interface KeyboardProps {
    activeKeys: ActiveNote[]
    musicSystem?: MusicSystem
    midiMode: MidiMode
    onKeyPressed: (note: MidiInputActiveNote[]) => void
    onAllMidiKeysPlayed?: () => void
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
    activeKeys,
    musicSystem = 'alphabetical',
    midiMode,
    onKeyPressed,
    onAllMidiKeysPlayed,
}: KeyboardProps) {
    const activeKeysReversed = [...activeKeys].reverse()
    const keyboardChannel = 16
    const keyboardVelocity = 100

    const notes = NOTE_NAMES.alphabetical.map((noteName) => ({
        name: noteName,
        velocity: keyboardVelocity,
        key: noteToKey(noteName),
        channel: keyboardChannel,
    }))

    function addNoteToActiveKeys(note: MidiInputActiveNote) {
        return [...activeKeys, note]
    }

    function handleMouseDown(note: MidiInputActiveNote) {
        const activeKeysCopy = addNoteToActiveKeys(note)
        onKeyPressed(activeKeysCopy)
    }

    function handleMouseUp(note: MidiInputActiveNote) {
        const { name, channel } = note
        const midiActiveNotes = activeKeys.filter(
            (activeKey) => activeKey.name === name && activeKey.channel !== channel
        )
        /*
           We don't want to remove all the activeNotes from the midi file with the same name.
           Sometimes the same note is hit at the same time but on different channels.
           We only remove the last note found and this is on purpose.
       */
        const lastMidiNote = midiActiveNotes.at(-1)

        if (lastMidiNote) {
            const activeKeysCopy = removeNotesFromActiveKeys(activeKeys, [note, lastMidiNote])
            const isAllNotesPlayed = activeKeysCopy.length === 0
            if (isAllNotesPlayed && onAllMidiKeysPlayed && midiMode === 'wait') {
                onKeyPressed(activeKeysCopy)
                onAllMidiKeysPlayed()
            } else {
                onKeyPressed(removeNotesFromActiveKeys(activeKeys, [note]))
            }
        } else {
            const activeKeysCopy = removeNotesFromActiveKeys(activeKeys, [note])
            const isAllNotesPlayed = activeKeysCopy.length === 0
            if (isAllNotesPlayed && onAllMidiKeysPlayed) {
                onAllMidiKeysPlayed()
            }
            onKeyPressed(activeKeysCopy)
        }
    }

    return (
        <ul className="keyboard">
            {notes.map((note) => {
                const { name } = note
                const isBlackKey = checkIsBlackKey(name)
                /*
                    Sometimes multiple instruments will play the same note at the same time, but we can only paint one color.
                    So we pick the last active key because this is the one on top in the Visualizer.
                */
                const lastActiveKey = activeKeysReversed.find(
                    (activeKey) => activeKey.name === name
                ) as MidiVisualizerActiveNote

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
                            background: isActive ? MIDI_CHANNEL_COLORS[lastActiveKey.channel] : '',
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
}
