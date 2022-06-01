import { parseArrayBuffer } from 'midi-json-parser'
import React from 'react'
import { midiJsonToNotes } from '../../utils'
import { MidiJson, MidiJsonNote } from '../../types'
import './midiimporter.scss'

interface MidiImporterProps {
    onMidiImport: (
        midiTrackTitle: string,
        midiTrackNotes: MidiJsonNote[]
    ) => void
}

export function MidiImporter({ onMidiImport }: MidiImporterProps) {
    function dropHandler(event: any) {
        event.preventDefault()

        let files = []

        if (event.dataTransfer.items) {
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    const file = event.dataTransfer.items[i].getAsFile()
                    files.push(file)
                }
            }
        } else {
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                files.push(event.dataTransfer.files[i])
            }
        }

        if (files.length) {
            const filesArr = Array.prototype.slice.call(files)
            const reader = new FileReader()
            reader.onload = function () {
                const arrayBuffer = this.result

                parseArrayBuffer(arrayBuffer as ArrayBuffer).then(
                    (json: MidiJson) => {
                        onMidiImport(filesArr[0].name, midiJsonToNotes(json))
                    }
                )
            }
            reader.readAsArrayBuffer(filesArr[0])
        }
    }

    function dragOverHandler(event: any) {
        event.preventDefault()
    }

    return (
        <div
            className="dropzone"
            onDrop={(event) => dropHandler(event)}
            onDragOver={(event) => dragOverHandler(event)}
        >
            <p>Drag a MIDI file to this Drop Zone</p>
        </div>
    )
}
