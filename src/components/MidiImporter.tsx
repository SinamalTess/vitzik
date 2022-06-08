import { parseArrayBuffer } from 'midi-json-parser'
import React, { useState } from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import './MidIimporter.scss'
import { Icon } from './generics/Icon'

interface MidiImporterProps {
    onMidiImport: OnMidiImport
}

export type OnMidiImport = (title: string, midiJSON: IMidiFile) => void
type midiImporterState = 'pending' | 'error' | 'dragging'

export function MidiImporter({ onMidiImport }: MidiImporterProps) {
    const [state, setState] = useState<midiImporterState>('pending')

    React.useEffect(() => {
        window.addEventListener('dragover', handleDragOver)
        window.addEventListener('drop', handleDrop)
        window.addEventListener('dragleave', handleDragLeave)

        return function () {
            window.removeEventListener('dragover', handleDragOver)
            window.removeEventListener('drop', handleDrop)
            window.removeEventListener('dragleave', handleDragLeave)
        }
    }, [])

    function handleDragOver(event: DragEvent) {
        event.preventDefault()
        setState('dragging')
        if (event.dataTransfer?.items[0].type !== 'audio/mid') {
            setState('error')
        }
    }

    function handleDragLeave(event: DragEvent) {
        setState('pending')
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault()

        if (state === 'error') return

        let files: File[] = []

        if (event.dataTransfer?.items) {
            const filesArr = Array.from(event.dataTransfer.items).filter(
                (item) => item.kind === 'file'
            )
            files = filesArr.map((file) => file.getAsFile()) as File[]
        } else if (event.dataTransfer?.files) {
            files = Array.from(event.dataTransfer.files)
        }

        if (files.length) {
            const reader = new FileReader()
            reader.onload = function () {
                const arrayBuffer = this.result

                parseArrayBuffer(arrayBuffer as ArrayBuffer).then((midiJSON: IMidiFile) => {
                    onMidiImport(files[0].name, midiJSON)
                })
            }
            reader.readAsArrayBuffer(files[0])
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
