import { render, screen } from '../../tests/utils/renderWithContext'
import React from 'react'
import { MidiVisualizer } from './MidiVisualizer'
import { DEFAULT_MIDI_INSTRUMENT } from '../../utils/const'
import * as midi from '../../tests/midi1.json'
import { IMidiFile } from 'midi-json-parser-worker'
import { getMidiMetas } from '../../utils'
import { act } from 'react-dom/test-utils'
import { dispatchWorkerTimeEvent } from '../../tests/utils/intervalWorkerEvent'

const midiJson = midi
const midiMetas = getMidiMetas(midiJson as IMidiFile)

jest.mock('../_hocs/WithContainerDimensions', () => ({
    WithContainerDimensions: (Component: any) => (props: any) => {
        return <Component {...props} height={100} width={200} />
    },
}))

describe('MidiVisualizer', () => {
    it('render the proper notes', async () => {
        render(
            <MidiVisualizer
                midiMetas={midiMetas}
                nextNoteStartingTime={null}
                activeInstruments={[DEFAULT_MIDI_INSTRUMENT]}
                activeTracks={[1]}
                midiFile={midiJson as IMidiFile}
                onChangeActiveNotes={() => {}}
                onChangeInstruments={() => {}}
                onChangeLoopTimes={() => {}}
                onChangeNextNoteStartingTime={() => {}}
                onChangeAudioPlayerState={() => {}}
            />
        )

        await act(async () => {
            dispatchWorkerTimeEvent(1200)
        })

        const notes = screen.getAllByLabelText(/note/)
        expect(notes.length).toBe(26)
    })
})
