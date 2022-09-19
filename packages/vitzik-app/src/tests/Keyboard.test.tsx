import { render, screen } from '@testing-library/react'
import App from '../App'
import { waitRequestMIDIAccessPromise } from './utils/acts'
import { touchKey } from './utils'
import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

describe('The keyboard', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
        jest.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
    })

    it('should set to active a key when touched', async () => {
        render(<App />)

        await waitRequestMIDIAccessPromise()
        await touchKey('A0')

        const correspondingKey = screen.getByTestId(/A0/)
        expect(correspondingKey).toHaveClass('keyboard__whitekey--active')
    })
})
