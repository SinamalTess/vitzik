import { render, screen } from '@testing-library/react'
import React from 'react'
import { Keyboard } from './Keyboard'
import { NB_BLACK_PIANO_KEYS, NB_WHITE_PIANO_KEYS } from '../utils/const'
import { ActiveNote } from '../types'

describe('Keyboard', () => {
    it('should render the proper number of keys', () => {
        render(<Keyboard notesPlayed={[]} activeKeys={[]} onKeyPressed={() => {}}></Keyboard>)
        const blackKeys = screen.getAllByText(/#/)
        const whiteKeys = screen.getAllByText(/[A-G]\d/)

        expect(blackKeys).toHaveLength(NB_BLACK_PIANO_KEYS)
        expect(whiteKeys).toHaveLength(NB_WHITE_PIANO_KEYS)
    })

    it('should highlight the active keys', () => {
        const whiteKey: ActiveNote = {
            name: 'A0',
            velocity: 100,
            key: 21,
            channel: 0,
        }

        const blackKey: ActiveNote = {
            name: 'A#0/Bb0',
            velocity: 100,
            key: 23,
            channel: 0,
        }

        render(
            <Keyboard
                notesPlayed={[]}
                activeKeys={[whiteKey, blackKey]}
                onKeyPressed={() => {}}
            ></Keyboard>
        )
        const correspondingWhiteKey = screen.getByTestId(/A0/)
        const correspondingBlackKey = screen.getByTestId(/A#0\/Bb0/)

        expect(correspondingWhiteKey).toHaveClass('keyboard__whitekey--active')
        expect(correspondingBlackKey).toHaveClass('keyboard__blackkey--active')
    })
})
