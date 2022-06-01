import React from 'react'
import { noteKeyToName } from '../../utils'
import { NB_WHITE_PIANO_KEYS } from '../../utils/const'
import './visualizer.scss'
import { MidiJsonNote } from '../../types'

interface VisualizerProps {
    notes: MidiJsonNote[]
    colors?: string[]
}

export function Visualizer({
    notes,
    colors = ['#dc202e', '#f7ed99', '#2d338b', '#76306b', '#ea8c2d'],
}: VisualizerProps) {
    let deltaAcc = 0
    return (
        <svg
            width="100%"
            height="200px"
            className="visualizer visualizer--cartesian"
        >
            {notes.map((note, index) => {
                const noteIndex =
                    note?.noteOn?.noteNumber || note?.noteOff?.noteNumber || 0
                const noteName = noteKeyToName(noteIndex)
                const isBlackKey = noteName.includes('#')
                const { delta } = note
                deltaAcc = deltaAcc + delta
                const isNoteOn = note.hasOwnProperty('noteOn')
                let heightAcc = 0
                if (isNoteOn) {
                    const endNoteIndex = notes.findIndex(
                        (note, ind) =>
                            note.noteOff?.noteNumber === noteIndex &&
                            ind > index
                    )
                    if (endNoteIndex > 0) {
                        for (let y = 0; y <= endNoteIndex - index; y++) {
                            heightAcc = heightAcc + notes[index + y].delta
                        }
                    }

                    return (
                        <>
                            <rect
                                rx="5"
                                ry="5"
                                width={
                                    isBlackKey
                                        ? 100 / NB_WHITE_PIANO_KEYS / 2 + '%'
                                        : 100 / NB_WHITE_PIANO_KEYS + '%'
                                }
                                height={heightAcc / 10}
                                x={(noteIndex * 100) / 88 - 21 + '%'}
                                y={deltaAcc / 10}
                                key={'note-' + noteIndex}
                                style={{
                                    fill: colors[
                                        Math.floor(
                                            Math.random() * colors.length
                                        )
                                    ],
                                }}
                                className={`visualizer__note${noteName} ${index}`}
                            />
                        </>
                    )
                } else {
                    return <></>
                }
            })}
        </svg>
    )
}
