import {
    MidiVisualizerActiveNote,
    AudioPlayerState,
    ActiveNote,
    MidiInputActiveNote,
    AlphabeticalNote,
    isMidiVisualizerActiveNote,
} from '../../types'
import { keyToNote, removeNotesFromActiveNotes } from '../../utils'
import React, { useEffect, useState } from 'react'
import { MIDI_INPUT_CHANNEL } from '../../utils/const'

interface MidiMessageManagerProps {
    midiInput: MIDIInput
    audioPlayerState: AudioPlayerState
    activeNotes: ActiveNote[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onAllMidiKeysPlayed: () => void
}

function getMessage(message: MIDIMessageEvent) {
    const key = message.data[1]
    const command = message.data[0]
    const name = keyToNote(message.data[1]) as AlphabeticalNote
    const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

    return {
        command,
        note: {
            name,
            velocity,
            key,
            channel: MIDI_INPUT_CHANNEL, // TODO: check if not provided
        },
    }
}

export function MidiMessageManager({
    midiInput,
    activeNotes,
    onChangeActiveNotes,
    onAllMidiKeysPlayed,
    audioPlayerState,
}: MidiMessageManagerProps) {
    const [notesBeingHeld, setNotesBeingHeld] = useState<MidiInputActiveNote[]>([])
    const [midiNotesAlreadyPlayed, setMidiNotesAlreadyPlayed] = useState<Set<string>>(new Set())

    useEffect(() => {
        function removeNote(note: MidiInputActiveNote) {
            setNotesBeingHeld((notesBeingHeld) =>
                removeNotesFromActiveNotes(notesBeingHeld, [note])
            )
            onChangeActiveNotes((prevActiveNotes) =>
                removeNotesFromActiveNotes(prevActiveNotes, [note])
            )
        }

        function checkAllMidiNotesPlayed(
            midiActiveNotes: MidiVisualizerActiveNote[],
            note: MidiInputActiveNote
        ) {
            return midiActiveNotes.every((midiActiveNote) => {
                const isCurrentNote = note.name && note.name === midiActiveNote.name
                const isNoteBeingHeld = notesBeingHeld.find(
                    (noteBeingHeld) => noteBeingHeld.name === midiActiveNote.name
                )
                const isNoteAlreadyPlayed = midiNotesAlreadyPlayed.has(midiActiveNote.id)

                return isCurrentNote || isNoteBeingHeld || isNoteAlreadyPlayed
            })
        }

        function addNote(note: MidiInputActiveNote) {
            setNotesBeingHeld((notesBeingHeld) => [...notesBeingHeld, note])

            const midiActiveNotes = activeNotes.filter((activeNote) =>
                isMidiVisualizerActiveNote(activeNote)
            ) as MidiVisualizerActiveNote[]

            const isAllMidiNotesPlayed = checkAllMidiNotesPlayed(midiActiveNotes, note)

            onChangeActiveNotes((prevActiveNotes) => [...prevActiveNotes, note])

            if (isAllMidiNotesPlayed) {
                const midiActiveNotesIds = midiActiveNotes.map(({ id }) => id)
                setMidiNotesAlreadyPlayed(
                    (midiNotesAlreadyPlayed) =>
                        new Set([...midiNotesAlreadyPlayed, ...midiActiveNotesIds])
                )
                onAllMidiKeysPlayed()
            }
        }

        function handleMIDIMessage(message: MIDIMessageEvent) {
            const { command, note } = getMessage(message)

            switch (command) {
                case 144: // noteOn
                    note.velocity > 0 ? addNote(note) : removeNote(note)
                    break
                case 128: // noteOff
                    removeNote(note)
                    break
            }
        }

        // @ts-ignore
        midiInput.addEventListener('midimessage', handleMIDIMessage)

        return function cleanup() {
            // @ts-ignore
            midiInput.removeEventListener('midimessage', handleMIDIMessage)
        }
    }, [
        activeNotes,
        midiInput,
        midiNotesAlreadyPlayed,
        notesBeingHeld,
        onAllMidiKeysPlayed,
        onChangeActiveNotes,
    ])

    useEffect(() => {
        if (audioPlayerState === 'rewinding') {
            setNotesBeingHeld([])
            setMidiNotesAlreadyPlayed(new Set())
        } else if (audioPlayerState === 'stopped') {
            setMidiNotesAlreadyPlayed(new Set())
            setNotesBeingHeld([])
        }
    }, [audioPlayerState])

    return null
}
