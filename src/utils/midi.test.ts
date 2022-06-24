import { getMidiInfos } from './midi'
import * as midi from './../tests/midi1.json'
import { IMidiFile } from 'midi-json-parser-worker'
import { MidiInfos } from '../types'

describe('getMidiInfos()', () => {
    it('should extract midi file infos from midi json', () => {
        const midiJson = midi as IMidiFile
        const expectedResult: MidiInfos = {
            format: 1,
            initialInstruments: [{ index: 1, name: 'Bright Acoustic Keyboard', channel: 0 }],
            midiDuration: 152999.267578125,
            msPerBeat: 750,
            playableTracksIndexes: [1],
            ticksPerBeat: 1024,
        }

        expect(getMidiInfos(midiJson)).toStrictEqual(expectedResult)
    })
})
