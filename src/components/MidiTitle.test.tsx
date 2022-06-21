import { render, screen } from '@testing-library/react'
import React from 'react'
import { MidiTitle } from './MidiTitle'

describe('MidiTitle', () => {
    it('normalizes the title of the midi file', () => {
        render(<MidiTitle midiTitle={'MyMidiFile.midi'}></MidiTitle>)

        expect(screen.getByText('MyMidiFile')).toBeDefined()
    })
})
