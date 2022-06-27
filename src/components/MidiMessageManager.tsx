import { ActiveNote, AudioPlayerState } from '../types'
import { keyToNote, removeNotesFromActiveKeys } from '../utils'
import React, { useEffect, useRef } from 'react'

interface MidiMessageManagerProps {
    midiInput: MIDIInput | null
    audioPlayerState: AudioPlayerState
    activeNotes: ActiveNote[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onAllMidiKeysPlayed: () => void
    onNotePlayed: React.Dispatch<React.SetStateAction<string[]>>
}

const USER_CHANNEL = 16

function getMessage(message: MIDIMessageEvent) {
    const key = message.data[1]
    const command = message.data[0]
    const name = keyToNote(message.data[1])
    const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

    return {
        command,
        note: {
            name,
            velocity,
            key,
            channel: USER_CHANNEL, // TODO: check if not provided
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
    const notesAlreadyPlayedRef: React.MutableRefObject<ActiveNote[]> = useRef([])
    const notesBeingHeldRef: React.MutableRefObject<ActiveNote[]> = useRef([])
    useEffect(() => {
        if (!midiInput) return

        function removeNote(note: ActiveNote) {
            notesBeingHeldRef.current = removeNotesFromActiveKeys(notesBeingHeldRef.current, [note])
            const activeNotesCopy = removeNotesFromActiveKeys(activeNotes, [note])
            onChangeActiveNotes(activeNotesCopy)
        }

        function addNote(activeNote: ActiveNote) {
            console.log('hello')
            notesBeingHeldRef.current.push(activeNote)
            const midiActiveNotes = activeNotes.filter(({ channel }) => channel !== USER_CHANNEL)

            const areAllMidiNotesPlayed = midiActiveNotes.every(
                (note) =>
                    notesBeingHeldRef.current.find((activeNote) => activeNote.name === note.name) ||
                    notesAlreadyPlayedRef.current.find((activeNote) => activeNote.id === note.id)
            )
            onChangeActiveNotes([...activeNotes, activeNote])
            if (areAllMidiNotesPlayed) {
                onAllMidiKeysPlayed()
                notesAlreadyPlayedRef.current =
                    notesAlreadyPlayedRef.current.concat(midiActiveNotes)
                const ids = midiActiveNotes
                    .filter((id) => Boolean(id))
                    .map(({ id }) => id) as string[]
                console.log({ ids })
                onNotePlayed((notes) => [...notes, ...ids])
            }
        }

        function handleMIDIMessage(message: MIDIMessageEvent) {
            const { command, note } = getMessage(message)

            console.log(command)

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
        midiInput.onmidimessage = handleMIDIMessage
    }, [activeNotes, midiInput, onAllMidiKeysPlayed, onChangeActiveNotes])

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
