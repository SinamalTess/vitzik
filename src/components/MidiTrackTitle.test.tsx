import { render, screen } from '@testing-library/react'
import React from 'react'
import { MidiTrackTitle } from './MidiTrackTitle'

describe('MidiTrackTitle', () => {
    test('normalizes the title of the midi file', () => {
        render(<MidiTrackTitle midiTrackTitle={'MyMidiFile.midi'}></MidiTrackTitle>)

        expect(screen.getByText('MyMidiFile')).toBeDefined()
    })
})
