import React, { useRef } from 'react'
import { VisualizerSection } from './VisualizerSection'
import { render, screen } from '@testing-library/react'
import { NoteCoordinates } from '../types'
import canvasMock from 'jest-canvas-mock'

jest.mock('react', () => {
    const originReact = jest.requireActual('react')
    const mockUseRef = jest.fn()
    return {
        ...originReact,
        useRef: mockUseRef,
    }
})

const notesCoordinates: NoteCoordinates[][] = [
    [
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
        },
    ],
]

describe('VisualizerSection', () => {
    beforeEach(() => {
        // @ts-ignore
        useRef.mockReturnValue({
            current: canvasMock,
        })
    })

    it('renders a canvas properly', () => {
        render(
            <VisualizerSection
                notesCoordinates={notesCoordinates}
                indexToDraw={0}
                width={100}
                height={50}
                index={0}
                top={'0%'}
            ></VisualizerSection>
        )
        const canvas = screen.getByTestId('visualizer__section--0')

        expect(canvas).toBeVisible()
    })
})
