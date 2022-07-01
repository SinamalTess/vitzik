import { screen, render, waitFor } from '@testing-library/react'
import React from 'react'
import App from './App'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import Mock = jest.Mock

jest.mock('./components/Staff', () => () => {
    return <div />
})

jest.mock('midi-json-parser', () => () => {
    return () => {}
})

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

describe('App', () => {
    it('should render', async () => {
        requestMIDIAccess.mockResolvedValue({
            inputs: {
                values: () => [],
            },
        })
        ;(Soundfont.instrument as Mock).mockResolvedValue('fakeInstrumentPlayer')
        render(<App />)
        await waitFor(() => {
            expect(screen.getByText('Import Midi')).toBeInTheDocument()
        })
    })
})
