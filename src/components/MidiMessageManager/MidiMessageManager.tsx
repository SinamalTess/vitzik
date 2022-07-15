import {
    MidiVisualizerActiveNote,
    AudioPlayerState,
    ActiveNote,
    MidiInputActiveNote,
    AlphabeticalNote,
    isMidiVisualizerActiveNote,
} from '../../types'
import { keyToNote, removeNotesFromActiveKeys } from '../../utils'
import React, { useEffect, useRef } from 'react'
import { MIDI_INPUT_CHANNEL } from '../../utils/const'

interface MidiMessageManagerProps {
    midiInput: MIDIInput | null
    audioPlayerState: AudioPlayerState
    activeNotes: ActiveNote[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onAllMidiKeysPlayed: () => void
    onNotePlayed: React.Dispatch<React.SetStateAction<string[]>>
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
    onNotePlayed,
}: MidiMessageManagerProps) {
    const notesAlreadyPlayedRef: React.MutableRefObject<MidiVisualizerActiveNote[]> = useRef([])
    const notesBeingHeldRef: React.MutableRefObject<MidiInputActiveNote[]> = useRef([])

    useEffect(() => {
        if (!midiInput) return
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
            midiInput?.removeEventListener('midimessage', handleMIDIMessage)
        }
    }, [midiInput])

    function removeNote(note: MidiInputActiveNote) {
        notesBeingHeldRef.current = removeNotesFromActiveKeys(notesBeingHeldRef.current, [note])
        const activeNotesCopy = removeNotesFromActiveKeys(activeNotes, [note])
        onChangeActiveNotes(activeNotesCopy)
    }

    function addNote(note: MidiInputActiveNote) {
        notesBeingHeldRef.current.push(note)
        const midiActiveNotes = activeNotes.filter((activeNote) =>
            isMidiVisualizerActiveNote(activeNote)
        ) as MidiVisualizerActiveNote[]

        const areAllMidiNotesPlayed = midiActiveNotes.every(
            (note) =>
                notesBeingHeldRef.current.find((activeNote) => activeNote.name === note.name) ||
                notesAlreadyPlayedRef.current.find((activeNote) => activeNote.id === note.id)
        )
        onChangeActiveNotes([...activeNotes, note])
        if (areAllMidiNotesPlayed) {
            notesAlreadyPlayedRef.current = notesAlreadyPlayedRef.current.concat(midiActiveNotes)
            const ids = midiActiveNotes.filter((id) => Boolean(id)).map(({ id }) => id) as string[]
            onAllMidiKeysPlayed()
            onNotePlayed((notes) => [...notes, ...ids])
        }
    }

    useEffect(() => {
        if (audioPlayerState === 'rewinding') {
            notesBeingHeldRef.current = []
            notesAlreadyPlayedRef.current = []
        } else if (audioPlayerState === 'stopped') {
            notesAlreadyPlayedRef.current = []
            notesBeingHeldRef.current = []
        }
    }, [audioPlayerState])

    return null
}
