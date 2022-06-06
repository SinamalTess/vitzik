import { parseArrayBuffer } from 'midi-json-parser'
import React, { useState } from 'react'
import { midiJsonToNotes } from '../utils'
import { MidiJsonNote } from '../types'
import { IMidiFile } from 'midi-json-parser-worker'
import './MidIimporter.scss'
import { Icon } from './generics/Icon'

interface MidiImporterProps {
    onMidiImport: (midiTrackTitle: string, midiTrackNotes: MidiJsonNote[]) => void
}

// TODO: allow to re-import another MIDI file

type midiImporterState = 'pending' | 'error' | 'dragging'

export function MidiImporter({ onMidiImport }: MidiImporterProps) {
    const [state, setState] = useState<midiImporterState>('pending')

    React.useEffect(() => {
        window.addEventListener('dragover', dragOverHandler)
        window.addEventListener('drop', dropHandler)
        window.addEventListener('dragleave', dragLeaveHandler)

        return function () {
            window.removeEventListener('dragover', dragOverHandler)
            window.removeEventListener('drop', dropHandler)
            window.removeEventListener('dragleave', dragLeaveHandler)
        }
    }, [])

    function dragOverHandler(event: DragEvent) {
        event.preventDefault()
        setState('dragging')
        if (event.dataTransfer?.items[0].type !== 'audio/mid') {
            setState('error')
        }
    }

    function dragLeaveHandler(event: DragEvent) {
        setState('pending')
    }

    function dropHandler(event: DragEvent) {
        event.preventDefault()

        if (state === 'error') return

        let files = []

        if (event.dataTransfer?.items) {
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    const file = event.dataTransfer.items[i].getAsFile()
                    files.push(file)
                }
            }
        } else {
            const length = event.dataTransfer?.files.length ?? 0
            for (let i = 0; i < length; i++) {
                files.push(event.dataTransfer?.files[i])
            }
        }

        if (files.length) {
            const filesArr = Array.prototype.slice.call(files)
            const reader = new FileReader()
            reader.onload = function () {
                const arrayBuffer = this.result

                parseArrayBuffer(arrayBuffer as ArrayBuffer).then((json: IMidiFile) => {
                    onMidiImport(filesArr[0].name, midiJsonToNotes(json))
                })
            }
            reader.readAsArrayBuffer(filesArr[0])
        }
        setState('pending')
    }

    return (
        <div className={`dropzone dropzone--${state}`}>
            <div className="dropzone__message">
                <Icon name="midi" size={75} />
                {state === 'error' ? (
                    <p>We only support MIDI files</p>
                ) : (
                    <p>Drag a MIDI file to this Drop Zone</p>
                )}
            </div>
        </div>
    )
}
