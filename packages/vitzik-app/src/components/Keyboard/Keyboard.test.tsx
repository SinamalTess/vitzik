import { render, screen } from '@testing-library/react'
import React from 'react'
import { Keyboard } from './Keyboard'
import { NB_BLACK_PIANO_KEYS, NB_WHITE_PIANO_KEYS } from '../../utils/const'
import { MidiInputActiveNote, MidiPlayMode } from '../../types'
import { clickKey } from '../../tests/utils'

const props = {
    midiPlayMode: 'autoplay' as MidiPlayMode,
    activeNotes: [],
    onChangeActiveNotes: jest.fn(),
}

const whiteKey: MidiInputActiveNote = {
    name: 'A0',
    velocity: 100,
    key: 21,
    channel: 1,
}

const blackKey: MidiInputActiveNote = {
    name: 'Bb0',
    velocity: 100,
    key: 23,
    channel: 1,
}

describe('Keyboard', () => {
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

    it('should allow the keyboard to be played', async () => {
        render(<Keyboard {...props}></Keyboard>)

        await clickKey('A1')

        expect(props.onChangeActiveNotes).toHaveBeenCalledWith([
            { channel: 18, key: 33, name: 'A1', velocity: 100 },
        ])
    })
})
