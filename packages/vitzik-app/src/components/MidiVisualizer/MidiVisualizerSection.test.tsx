import React, { useRef } from 'react'
import { MidiVisualizerSection } from './MidiVisualizerSection'
import { render, screen } from '@testing-library/react'
import canvasMock from 'jest-canvas-mock'
import { MidiVisualizerNoteEvent } from './utils'

jest.mock('react', () => {
    const originReact = jest.requireActual('react')
    const mockUseRef = jest.fn()
    return {
        ...originReact,
        useRef: mockUseRef,
    }
})

const notesCoordinates: MidiVisualizerNoteEvent[] = [
    {
        duration: 10,
        velocity: 100,
        name: 'A0',
        key: 21,
        w: 5,
        h: 10,
        x: 10,
        y: 5,
        channel: 0,
        startingTime: 0,
        uniqueId: '1',
        eventType: 'note',
    },
]

describe('MidiVisualizerSection', () => {
    beforeEach(() => {
        // @ts-ignore
        useRef.mockReturnValue({
            current: canvasMock,
        })
    })

    it('should render a section properly', () => {
        render(
            <MidiVisualizerSection
                notesCoordinates={notesCoordinates}
                width={100}
                height={50}
                index={0}
            ></MidiVisualizerSection>
        )

        const section = screen.getByTestId('midi-visualizer__section--0')
        expect(section).toBeVisible()
    })
})
