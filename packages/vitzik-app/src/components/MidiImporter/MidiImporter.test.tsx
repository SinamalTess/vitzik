import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MidiImporter } from './MidiImporter'
import * as reactDeviceDetect from 'react-device-detect'
import { dragInvalidFile, dragValidFile } from '../../tests/utils'

const onMidiImport = vi.fn()

describe('MidiImporter', () => {
    it('should start in pending state', () => {
        render(<MidiImporter isMidiImported={false} onMidiImport={onMidiImport} />)

        expect(screen.getByText(/Drag and drop a MIDI file to this dropzone/)).toBeInTheDocument()
        expect(screen.getByText(/Example/i)).toBeInTheDocument()
    })

    it('should show an example button that load a midi song', async () => {
        render(<MidiImporter isMidiImported={false} onMidiImport={onMidiImport} />)

        const button = screen.getByText(/Example/i)
        fireEvent.click(button)

        await waitFor(() => {
            expect(onMidiImport).toHaveBeenCalledWith('Turkish March - Mozart', {
                division: 240,
                format: 0,
                tracks: expect.anything(),
            })
        })
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

    it('should show a input when using a mobile', () => {
        // @ts-ignore
        reactDeviceDetect.isDesktop = false
        render(<MidiImporter isMidiImported={false} onMidiImport={onMidiImport} />)

        expect(screen.getByText('Select a MIDI file to import')).toBeInTheDocument()
        expect(screen.getByTestId('midiInput')).toBeInTheDocument()
    })
})
