import { render, screen } from '@testing-library/react'
import App from '../App'
import { clickMidiExample } from './utils'
import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

describe('The visualizer', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
        vi.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
    })

    it('should render', async () => {
        render(<App />)

        await clickMidiExample()

        const notes = screen.getAllByLabelText(/note/)
        expect(notes.length).toBe(57)
    })
})
