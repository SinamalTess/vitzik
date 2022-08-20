import {
    MidiVisualizerActiveNote,
    AudioPlayerState,
    ActiveNote,
    MidiInputActiveNote,
    AlphabeticalNote,
    isMidiVisualizerActiveNote,
    MidiAccessMode,
} from '../../types'
import { keyToNote } from '../../utils'
import React, { useEffect, useState } from 'react'
import { MIDI_INPUT_CHANNEL } from '../../utils/const'
import { MIDI_MESSAGE_CONTROL } from '../../utils/const/midi_message_controls'

interface MidiMessageManagerProps {
    midiInput: MIDIInput
    midiOutput: MIDIOutput | null
    midiAccessMode: MidiAccessMode
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
            channel: MIDI_INPUT_CHANNEL,
        },
    }
}

export function MidiMessageManager({
    midiInput,
    midiOutput,
    midiAccessMode,
    activeNotes,
    onChangeActiveNotes,
    onAllMidiKeysPlayed,
    audioPlayerState,
}: MidiMessageManagerProps) {
    const [notesBeingHeld, setNotesBeingHeld] = useState<MidiInputActiveNote[]>([])
    const [midiNotesAlreadyPlayed, setMidiNotesAlreadyPlayed] = useState<Set<string>>(new Set())

    useEffect(() => {
        function onNoteOff(note: MidiInputActiveNote) {
            setNotesBeingHeld((notesBeingHeld) => removeActiveNotes(notesBeingHeld, [note]))
            onChangeActiveNotes((prevActiveNotes) => removeActiveNotes(prevActiveNotes, [note]))
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
                const isNoteAlreadyPlayed = midiNotesAlreadyPlayed.has(midiActiveNote.uniqueId)

                return isCurrentNote || isNoteBeingHeld || isNoteAlreadyPlayed
            })
        }

        function onNoteOn(note: MidiInputActiveNote) {
            setNotesBeingHeld((notesBeingHeld) => [...notesBeingHeld, note])

            const midiActiveNotes = activeNotes.filter((activeNote) =>
                isMidiVisualizerActiveNote(activeNote)
            ) as MidiVisualizerActiveNote[]

            onChangeActiveNotes((prevActiveNotes) => [...prevActiveNotes, note])

            const isAllMidiNotesPlayed = checkAllMidiNotesPlayed(midiActiveNotes, note)

            if (isAllMidiNotesPlayed) {
                const midiActiveNotesIds = midiActiveNotes.map(({ uniqueId }) => uniqueId)
                setMidiNotesAlreadyPlayed(
                    (midiNotesAlreadyPlayed) =>
                        new Set([...midiNotesAlreadyPlayed, ...midiActiveNotesIds])
                )
                onAllMidiKeysPlayed()
            }
        }

        function removeActiveNotes(activeNotes: ActiveNote[], notesToBeRemoved: ActiveNote[]) {
            return activeNotes.filter(
                (activeNote) =>
                    !notesToBeRemoved.some(({ channel, name }) => {
                        const isSameChannel = channel === activeNote.channel
                        const isSameName = name === activeNote.name
                        return isSameChannel && isSameName
                    })
            )
        }

        function handleMIDIMessage(message: MIDIMessageEvent) {
            const { command, note } = getMessage(message)
            switch (command) {
                case MIDI_MESSAGE_CONTROL.NOTE_ON:
                    note.velocity > 0 ? onNoteOn(note) : onNoteOff(note)
                    break
                case MIDI_MESSAGE_CONTROL.NOTE_OFF:
                    onNoteOff(note)
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
        if (audioPlayerState === 'stopped') {
            setMidiNotesAlreadyPlayed(new Set())
            setNotesBeingHeld([])
        }
    }, [audioPlayerState])

    return null
}
