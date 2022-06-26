import { ActiveNote } from '../types'
import { keyToNote, removeNotesFromActiveKeys } from '../utils'
import React, { useEffect } from 'react'

interface MidiMessageManagerProps {
    midiInput: MIDIInput | null
    activeNotes: ActiveNote[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onAllMidiKeysPlayed: () => void
}

const USER_CHANNEL = 16

export function MidiMessageManager({
    midiInput,
    activeNotes,
    onChangeActiveNotes,
    onAllMidiKeysPlayed,
}: MidiMessageManagerProps) {
    useEffect(() => {
        if (!midiInput) return
        // @ts-ignore
        midiInput.onmidimessage = handleMIDIMessage
    }, [midiInput])

    if (!midiInput) return null

    function removeNote(note: ActiveNote) {
        const { name, channel } = note
        const midiActiveNotes = activeNotes.filter(
            (activeNote) => activeNote.name === name && activeNote.channel !== channel
        )
        const lastMidiNote = midiActiveNotes.at(-1)
        /*
            We don't want to remove all the activeNotes from the midi file with the same name.
            Sometimes the same note is hit at the same time but on different channels.
            We only remove the last note found and this is on purpose.
        */
        if (lastMidiNote) {
            const activeNotesCopy = removeNotesFromActiveKeys(activeNotes, [note, lastMidiNote])
            const isAllNotesPlayed = activeNotesCopy.length === 0
            if (isAllNotesPlayed) {
                onAllMidiKeysPlayed()
            }
            onChangeActiveNotes(activeNotesCopy)
        } else {
            const activeNotesCopy = removeNotesFromActiveKeys(activeNotes, [note])
            const isAllNotesPlayed = activeNotesCopy.length === 0
            if (isAllNotesPlayed) {
                onAllMidiKeysPlayed()
            }
            onChangeActiveNotes(activeNotesCopy)
        }

        onChangeActiveNotes((activeNotes) => removeNotesFromActiveKeys(activeNotes, [note]))
    }

    function addNote(note: ActiveNote) {
        onChangeActiveNotes((notes) => [...notes, note])
    }

    function handleMIDIMessage(message: MIDIMessageEvent) {
        const key = message.data[1]
        const command = message.data[0]
        const name = keyToNote(message.data[1])
        const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

        const note = {
            name,
            velocity,
            key,
            channel: USER_CHANNEL, // TODO: check if not provided
        }

        switch (command) {
            case 144: // noteOn
                velocity > 0 ? addNote(note) : removeNote(note)
                break
            case 128: // noteOff
                removeNote(note)
                break
        }
    }

    return null
}
