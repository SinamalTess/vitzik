import { render, screen } from '@testing-library/react'
import React from 'react'
import { Keyboard } from './Keyboard'
import { NB_BLACK_PIANO_KEYS, NB_WHITE_PIANO_KEYS } from '../../const'
import { MidiInputActiveNote, MidiPlayMode } from '../../types'
import { clickKey, clickMidiExample, touchKey } from '../../tests/utils'
import {
    midiAccessMock,
    MidiInputMock,
    requestMIDIAccess,
} from '../../tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import { instrumentPlayerMock } from '../../tests/mocks/SoundFont'
import App from '../../App'
import { waitRequestMIDIAccessPromise } from '../../tests/utils/acts'
import { dispatchIntervalWorkerEvent } from '../../tests/utils/intervalWorker'

const props = {
    midiPlayMode: 'autoplay' as MidiPlayMode,
    activeNotes: [],
    onChangeActiveNotes: vi.fn(),
}

const whiteKey: MidiInputActiveNote = {
    name: 'A0',
    velocity: 100,
    key: 21,
    channel: 1,
}

const midiInput = new MidiInputMock('Piano', 'Yamaha')

const blackKey: MidiInputActiveNote = {
    name: 'Bb0',
    velocity: 100,
    key: 23,
    channel: 1,
}

describe('Keyboard', () => {
    beforeEach(async () => {
        requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
        vi.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
    })

    it('should set to active a key when touched', async () => {
        render(<App />)

        await waitRequestMIDIAccessPromise()
        await touchKey('A0')

        const correspondingKey = screen.getByTestId(/A0/)
        expect(correspondingKey).toHaveClass('keyboard__whitekey--active')
    })

    it.skip('should highlight the active keys when moving forward', async () => {
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

    it('should render the proper number of keys', () => {
        render(<Keyboard {...props}></Keyboard>)

        const blackKeys = screen.getAllByText(/[a-g]\d/)
        const whiteKeys = screen.getAllByText(/[A-G]\d/)

        expect(blackKeys).toHaveLength(NB_BLACK_PIANO_KEYS)
        expect(whiteKeys).toHaveLength(NB_WHITE_PIANO_KEYS)
    })

    it('should highlight the active keys', () => {
        render(<Keyboard {...props} activeNotes={[whiteKey, blackKey]}></Keyboard>)

        const correspondingWhiteKey = screen.getByTestId(/A0/)
        const correspondingBlackKey = screen.getByTestId(/Bb0/)

        expect(correspondingWhiteKey).toHaveClass('keyboard__whitekey--active')
        expect(correspondingBlackKey).toHaveClass('keyboard__blackkey--active')
    })

    it('should remove the active key when played', async () => {
        render(
            <Keyboard
                {...props}
                activeNotes={[whiteKey]}
                midiPlayMode={'waitForValidInput'}
            ></Keyboard>
        )

        await clickKey('A0')

        expect(props.onChangeActiveNotes).toHaveBeenCalledWith([])
    })
})
