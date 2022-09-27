import React, { useRef } from 'react'
import { Slide } from './Slide'
import { render, screen } from '@testing-library/react'
import canvasMock from 'jest-canvas-mock'
import { VisualizerNoteEvent } from '../../types'
import { MidiVisualizerConfig } from '../../../../types/MidiVisualizerConfig'

jest.mock('react', () => {
    const originReact = jest.requireActual('react')
    const mockUseRef = jest.fn()
    return {
        ...originReact,
        useRef: mockUseRef,
    }
})

const noteEvents: VisualizerNoteEvent[] = [
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

describe('MidiVisualizerSlide', () => {
    beforeEach(() => {
        // @ts-ignore
        useRef.mockReturnValue({
            current: canvasMock,
        })
    })

    it('should render a section properly', () => {
        const config: MidiVisualizerConfig = {
            width: 100,
            height: 50,
            msPerSection: 2000,
            showDampPedal: false,
            showLoopEditor: false,
            activeTracks: [],
            loopTimestamps: [null, null],
        }
        render(<Slide events={noteEvents} config={config} index={0}></Slide>)

        const section = screen.getByTestId('midi-visualizer__slide--0')
        expect(section).toBeVisible()
    })
})
