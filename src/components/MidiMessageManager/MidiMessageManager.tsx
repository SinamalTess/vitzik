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
import { MidiAccessMode } from '../../types/MidiAccessMode'
import { usePrevious } from '../../_hooks'
import { MIDI_MESSAGE_CONTROL, NOTE_ON } from '../../utils/const/midi_message_controls'

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

const LIMIT = 2

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
    const prevActiveKeys = usePrevious<ActiveNote[]>(activeNotes)

    useEffect(() => {
        // /!\ EXPERIMENTAL /!\
        if (midiAccessMode === 'output' && midiOutput && activeNotes.length) {
            let newNotes = activeNotes

            if (prevActiveKeys) {
                const isNewNote = (note: ActiveNote) =>
                    !prevActiveKeys.find(
                        (prevActiveKey) =>
                            'id' in prevActiveKey && 'id' in note && prevActiveKey.id === note.id
                    )

                newNotes = activeNotes.filter((note) => isNewNote(note))
            }

            if (newNotes.length) {
                for (let i = 0; i < Math.min(LIMIT, newNotes.length); i++) {
                    const noteOnMessage = [0x90, newNotes[i].key, 0x7f] // note on, key, full velocity
                    midiOutput.send(noteOnMessage)
                }
            }
        }
    }, [midiAccessMode, activeNotes])

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
                case MIDI_MESSAGE_CONTROL.NOTE_ON:
                    note.velocity > 0 ? addNote(note) : removeNote(note)
                    break
                case MIDI_MESSAGE_CONTROL.NOTE_OFF:
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
        if (audioPlayerState === 'stopped') {
            setMidiNotesAlreadyPlayed(new Set())
            setNotesBeingHeld([])
        }
    }, [audioPlayerState])

    return null
}
