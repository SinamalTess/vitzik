import React from 'react'
import { noteKeyToName } from '../utils'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from '../utils/const'
import './Visualizer.scss'
import { MidiJsonNote } from '../types'

interface VisualizerProps {
    notes: MidiJsonNote[]
    color?: string
    trackPosition: number
}

export function Visualizer({ notes, color = '#00E2DC', trackPosition }: VisualizerProps) {
    let deltaAcc = 0
    return (
        <svg
            className="visualizer visualizer--cartesian"
            style={{ transform: `translateY(${trackPosition}%) scaleY(-1)` }}
        >
            {notes.map((note, index) => {
                const noteNumber = note?.noteOn?.noteNumber || note?.noteOff?.noteNumber || 0
                const noteName = noteKeyToName(noteNumber)
                const isBlackKey = noteName.includes('#')
                const isNoteOn = note.hasOwnProperty('noteOn')
                const { delta } = note

                let heightAcc = 0
                deltaAcc = deltaAcc + delta

                if (isNoteOn) {
                    const endNoteIndex = notes.findIndex(
                        (note, i) => note.noteOff?.noteNumber === noteNumber && i > index
                    )
                    if (endNoteIndex > 0) {
                        for (let y = 0; y <= endNoteIndex - index; y++) {
                            heightAcc = heightAcc + notes[index + y].delta
                        }
                    }
                    const widthWhiteKey = 100 / NB_WHITE_PIANO_KEYS
                    const margin = !isBlackKey ? widthWhiteKey / 4 : widthWhiteKey / 2
                    const width = isBlackKey ? `${widthWhiteKey / 2}%` : `${widthWhiteKey}%`

                    const previousKeys = NOTES.alphabetical.slice(
                        0,
                        noteNumber - MIDI_PIANO_KEYS_OFFSET
                    )

                    const nbPreviousWhiteKeys = previousKeys.filter(
                        (note) => !note.includes('#')
                    ).length
                    const x = nbPreviousWhiteKeys * widthWhiteKey - margin + '%'

                    return (
                        <rect
                            rx="5"
                            ry="5"
                            width={width}
                            height={heightAcc / 10}
                            x={x}
                            y={deltaAcc / 10}
                            key={'note-' + noteNumber + index}
                            style={{
                                fill: color,
                            }}
                            className={`visualizer__note${noteName} ${index}`}
                        />
                    )
                } else {
                    return null
                }
            })}
        </svg>
    )
}
