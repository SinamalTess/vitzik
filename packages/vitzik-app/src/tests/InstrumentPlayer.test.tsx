import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'
import App from '../App'
import { render } from '@testing-library/react'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

describe('The Instrument Player', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
        jest.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
    })

    it('should let the font', async () => {
        render(<App />)
    })
})
