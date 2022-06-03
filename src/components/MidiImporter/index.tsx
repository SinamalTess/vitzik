import { parseArrayBuffer } from 'midi-json-parser'
import React from 'react'
import { midiJsonToNotes } from '../../utils'
import { MidiJson, MidiJsonNote } from '../../types'
import './midiimporter.scss'
import { Icon } from '../generics/Icon'

interface MidiImporterProps {
    onMidiImport: (midiTrackTitle: string, midiTrackNotes: MidiJsonNote[]) => void
}

// TODO: make dropzone fullscreen
// TODO: allow to re-import another MIDI file
// TODO: verify the type of file and if not MIDI show an error

export function MidiImporter({ onMidiImport }: MidiImporterProps) {
    function dropHandler(event: React.DragEvent<HTMLDivElement>) {
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

                parseArrayBuffer(arrayBuffer as ArrayBuffer).then((json: MidiJson) => {
                    onMidiImport(filesArr[0].name, midiJsonToNotes(json))
                })
            }
            reader.readAsArrayBuffer(filesArr[0])
        }
    }

    function dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault()
    }

    return (
        <div
            className="dropzone pd-lg"
            onDrop={(event) => dropHandler(event)}
            onDragOver={(event) => dragOverHandler(event)}
        >
            <Icon name="midi" size={75} />
            <p>Drag a MIDI file to this Drop Zone</p>
        </div>
    )
}
