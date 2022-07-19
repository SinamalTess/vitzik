import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MidiImporter } from './MidiImporter'

jest.mock('midi-json-parser', () => () => {})

const onMidiImport = jest.fn()

const dragValidFile = () => {
    const dropzone = screen.getByText(/dropzone/)
    fireEvent.dragOver(dropzone, {
        dataTransfer: {
            items: [new File(['(⌐□_□)'], 'midi-track.midi', { type: 'audio/mid' })],
        },
    })
}

const dragInvalidFile = () => {
    const dropzone = screen.getByText(/dropzone/)
    fireEvent.dragOver(dropzone, {
        dataTransfer: {
            items: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })],
        },
    })
}

describe('MidiImporter', () => {
    it('should start in pending state', () => {
        render(<MidiImporter isMidiImported={false} onMidiImport={onMidiImport} />)

        expect(screen.getByText(/Drag and drop a MIDI file to this dropzone/)).toBeInTheDocument()
    })

    it('should show an error message when the wrong file type is dragged over', () => {
        render(<MidiImporter isMidiImported={false} onMidiImport={onMidiImport} />)
        dragInvalidFile()

        expect(screen.getByText(/We only support MIDI files/)).toBeInTheDocument()
    })

    it('should show a valid message when the right file type is dragged over', () => {
        render(<MidiImporter isMidiImported={false} onMidiImport={onMidiImport} />)
        dragValidFile()

        expect(screen.getByText(/valid/)).toBeInTheDocument()
    })
})
