import React, { useRef } from 'react'
import { Slide } from './Slide'
import { render, screen } from '@testing-library/react'
import canvasMock from 'jest-canvas-mock'
import { MidiVisualizerConfig } from '../../../../types/MidiVisualizerConfig'
import { NoteEvent } from '../../classes/NoteEvent'
import { AlphabeticalNote } from '../../../../types'

jest.mock('react', () => {
    const originReact = jest.requireActual('react')
    const mockUseRef = jest.fn()
    return {
        ...originReact,
        useRef: mockUseRef,
    }
})

const coordinates = {
    w: 5,
    h: 10,
    x: 10,
    y: 5,
}

const note = {
    velocity: 100,
    name: 'A0' as AlphabeticalNote,
    key: 21,
    channel: 0,
}

const metas = {
    duration: 10,
    channel: 0,
    startingTime: 0,
}

const noteEvents: NoteEvent[] = [new NoteEvent(coordinates, metas, note)]

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
