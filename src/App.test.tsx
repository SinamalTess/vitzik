import { screen, render, fireEvent } from '@testing-library/react'
import React, { ReactNode } from 'react'
import App from './App'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import userEvent from '@testing-library/user-event'

interface TooltipProps {
    children: ReactNode
}

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

jest.mock('./components/_presentational/Tooltip', () => ({
    Tooltip: ({ children }: TooltipProps) => {
        return children
    },
}))

jest.mock('midi-json-parser', () => () => {})

const clickExtraSettings = () => {
    const button = screen.getByLabelText(/settings/)
    userEvent.click(button)
}

const dropFile = () => {
    const dropzone = screen.getByLabelText(/drop files here/i)
    fireEvent.drop(dropzone, {
        dataTransfer: {
            files: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })],
        },
    })
}

describe('App', () => {
    beforeEach(() => {
        requestMIDIAccess.mockResolvedValue({
            inputs: {
                values: () => [],
            },
        })

        // @ts-ignore
        Soundfont.instrument.mockResolvedValue('fakeInstrumentPlayer')
    })

    afterEach(() => jest.clearAllMocks())

    it('should render', async () => {
        render(<App />)
        expect(screen.getByText('Import Midi')).toBeInTheDocument()
        expect(screen.getByText(/Music theory/i)).toBeInTheDocument()
    })

    it('should let extra settings be opened', async () => {
        render(<App />)
        clickExtraSettings()
        expect(screen.getByText(/User Instrument/i)).toBeVisible()
    })

    it('should let a midi file be dropped', async () => {
        render(<App />)
        clickExtraSettings()
        expect(screen.getByText(/User Instrument/i)).toBeVisible()
    })
})
