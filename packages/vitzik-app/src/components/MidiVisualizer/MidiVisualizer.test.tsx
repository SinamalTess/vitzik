import React from 'react'
import { MidiVisualizer } from './MidiVisualizer'
import { DEFAULT_MIDI_INSTRUMENT } from '../../utils/const'
import * as midi from '../../tests/midi1.json'
import { IMidiFile } from 'midi-json-parser-worker'
import { getMidiMetas } from '../../utils'
import { render, screen } from '@testing-library/react'

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

        const notes = screen.getAllByLabelText(/note/)
        expect(notes.length).toBe(26)
    })
})
