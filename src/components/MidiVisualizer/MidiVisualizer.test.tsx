import { render, screen } from '@testing-library/react'
import React from 'react'
import { MidiVisualizer } from './MidiVisualizer'
import { IntervalWorkerMock } from '../../tests/mocks/intervalWorker'
import { DEFAULT_MIDI_INSTRUMENT } from '../../utils/const'
import * as midi from './../../tests/midi1.json'
import { IMidiFile } from 'midi-json-parser-worker'
import { getMidiMetas } from '../../utils'
import { act } from 'react-dom/test-utils'

const worker = new IntervalWorkerMock('')
const midiJson = midi
const midiMetas = getMidiMetas(midiJson as IMidiFile)

const mockWorkerTimeEvent = (newTime: number) => {
    const callbacks = worker.callbacks
    callbacks.forEach((callback) =>
        callback({
            data: {
                time: newTime,
            },
        })
    )
}

jest.mock('../_hocs/WithContainerDimensions', () => ({
    WithContainerDimensions: (Component: any) => (props: any) => {
        return <Component {...props} height={100} width={200} />
    },
}))

describe('MidiVisualizer', () => {
    it('render the proper notes', async () => {
        render(
            <MidiVisualizer
                intervalWorker={worker as Worker}
                midiMetas={midiMetas}
                activeInstruments={[DEFAULT_MIDI_INSTRUMENT]}
                activeTracks={[1]}
                midiFile={midiJson as IMidiFile}
                onChangeActiveNotes={() => {}}
                onChangeInstruments={() => {}}
                onChangeLoopTimes={() => {}}
                onChangeTimeToNextNote={() => {}}
            />
        )

        await act(async () => {
            mockWorkerTimeEvent(10)
        })

        const notes = screen.getAllByLabelText(/note/)

        expect(notes.length).toBe(26)
    })
})
