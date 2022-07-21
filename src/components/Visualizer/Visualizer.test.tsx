import { render, screen } from '@testing-library/react'
import React from 'react'
import { Visualizer } from './Visualizer'
import { WorkerMock } from '../../tests/mocks/worker'
import { DEFAULT_MIDI_INSTRUMENT } from '../../utils/const'
import * as midi from './../../tests/midi1.json'
import { IMidiFile } from 'midi-json-parser-worker'
import { getMidiMetas } from '../../utils'
import { act } from 'react-dom/test-utils'

const worker = new WorkerMock('')
const midiJson = midi
const midiMetas = getMidiMetas(midiJson as IMidiFile)

const mockWorkerTimeEvent = () => {
    worker.callback({
        data: {
            time: 10,
        },
    })
}

jest.mock('../_hocs/WithContainerDimensions', () => ({
    WithContainerDimensions: (Component: any) => (props: any) => {
        return <Component {...props} height={100} width={200} />
    },
}))

describe('Visualizer', () => {
    it('render the proper notes', async () => {
        render(
            <Visualizer
                worker={worker as Worker}
                midiMetas={midiMetas}
                audioPlayerState={'playing'}
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
            mockWorkerTimeEvent()
        })

        const notes = screen.getAllByLabelText(/note/)

        expect(notes.length).toBe(26)
    })
})
