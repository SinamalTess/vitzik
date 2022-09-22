import { render, screen } from '@testing-library/react'
import App from '../App'
import { waitRequestMIDIAccessPromise } from './utils/acts'
import { clickMidiExample, touchKey } from './utils'
import React from 'react'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from './mocks/SoundFont'
import { dispatchIntervalWorkerEvent } from './utils/intervalWorker'

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

    it('should highlight the active keys when moving forward', async () => {
        render(<App />)

        await clickMidiExample()
        await waitRequestMIDIAccessPromise()
        await dispatchIntervalWorkerEvent(3000)

        const activeKeys = await screen.findAllByTestId(/active/)
        expect(activeKeys).toHaveLength(3)
        expect(activeKeys[0]).toHaveTextContent('C4')
        expect(activeKeys[1]).toHaveTextContent('E4')
        expect(activeKeys[2]).toHaveTextContent('A5')
    })
})
