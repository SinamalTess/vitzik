import { parseArrayBuffer } from 'midi-json-parser'
import React, { useEffect, useState } from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import './MidIimporter.scss'
import clsx from 'clsx'
import { isDesktop } from 'react-device-detect'
import { Button } from '../_presentational/Button'
import { TURKISH_MARCH } from '../../utils/const'

interface MidiImporterProps {
    isMidiImported: boolean
    onMidiImport: (title: string, midiJSON: IMidiFile) => void
}

type midiImporterState = 'pristine' | 'pending' | 'error' | 'valid'

const BASE_CLASS = 'dropzone'

function getFiles(event: DragEvent) {
    let files: File[] = []

    if (event.dataTransfer?.items) {
        // @ts-ignore
        const filesArr = [...event.dataTransfer.items].filter((item) => item.kind === 'file')
        files = filesArr.map((file) => file.getAsFile()) as File[]
    } else if (event.dataTransfer?.files) {
        // @ts-ignore
        files = [...event.dataTransfer.files] // turn into an array
    }

    return files
}

function parseMidiFile(files: File[], callback: (fileName: string, midiJson: IMidiFile) => void) {
    const reader = new FileReader()
    reader.onload = function () {
        const arrayBuffer = this.result

        parseArrayBuffer(arrayBuffer as ArrayBuffer).then((midiJSON: IMidiFile) => {
            callback(files[0].name, midiJSON)
        })
    }
    reader.readAsArrayBuffer(files[0])
}

export function MidiImporter({ isMidiImported, onMidiImport }: MidiImporterProps) {
    const [state, setState] = useState<midiImporterState>('pristine')

    useEffect(() => {
        if (isDesktop) {
            window.addEventListener('dragover', handleDragOver)
            window.addEventListener('drop', handleDrop)
            window.addEventListener('dragleave', handleDragLeave)
        }

        return function cleanup() {
            if (isDesktop) {
                window.removeEventListener('dragover', handleDragOver)
                window.removeEventListener('drop', handleDrop)
                window.removeEventListener('dragleave', handleDragLeave)
            }
        }
    }, [])

    function handleDragOver(event: DragEvent) {
        event.preventDefault()
        setState('valid')
        if (event.dataTransfer?.items[0].type !== 'audio/mid') {
            setState('error')
        }
    }

    function handleDragLeave() {
        isMidiImported ? setState('pending') : setState('pristine')
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault()

        if (state === 'error') return

        const files = getFiles(event)

        if (files.length) {
            parseMidiFile(files, onMidiImport)
        }

        setState('pending')
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { files } = event.target

        if (files && files.length) {
            parseMidiFile(Array.from(files), onMidiImport)
        }

        setState('pending')
    }

    function handleClick() {
        onMidiImport('Turkish March', TURKISH_MARCH as IMidiFile)
        setState('pending')
    }

    const message = () => {
        switch (state) {
            case 'error':
                return 'We only support MIDI files :('
            case 'valid':
                return 'Oh that looks like a valid file! :)'
            default:
                return isDesktop ? (
                    <>
                        Drag and drop a MIDI file to this dropzone, or try with an
                        <Button onClick={handleClick}> example </Button>
                    </>
                ) : (
                    'Select a MIDI file to import'
                )
        }
    }

    const classNamesMessage = clsx(`${BASE_CLASS}__message`, {
        [`${BASE_CLASS}__message--error`]: state === 'error',
    })

    const className = clsx(BASE_CLASS, {
        [`${BASE_CLASS}--${state}`]: state,
    })

    return (
        <div className={className}>
            <div className={classNamesMessage}>
                <span>{message()}</span>
                {!isDesktop ? (
                    <input type="file" name="avatar" accept=".midi, .mid" onChange={handleChange} />
                ) : null}
            </div>
        </div>
    )
}
