import { render, screen } from '@testing-library/react'
import React from 'react'
import { Keyboard } from './Keyboard'
import { NB_BLACK_PIANO_KEYS, NB_WHITE_PIANO_KEYS } from '../utils/const'
import { ActiveNote } from '../App'

describe('Keyboard', () => {
    test('renders the proper number of keys', () => {
        render(<Keyboard activeKeys={[]} onKeyPressed={() => {}}></Keyboard>)
        const blackKeys = screen.getAllByText(/#/)
        const whiteKeys = screen.getAllByText(/[A-G]\d/)

        expect(blackKeys).toHaveLength(NB_BLACK_PIANO_KEYS)
        expect(whiteKeys).toHaveLength(NB_WHITE_PIANO_KEYS)
    })
    test('highlight active keys', () => {
        const note: ActiveNote = {
            name: 'A0',
            velocity: 100,
            key: 21,
        }
        render(<Keyboard activeKeys={[note]} onKeyPressed={() => {}}></Keyboard>)
        const relatedKey = screen.getByTestId(/A0/)
        expect(relatedKey).toHaveClass('keyboard__whitekey--active')
    })
})
