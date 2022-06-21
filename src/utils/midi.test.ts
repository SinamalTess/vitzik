import { getMidiInfos } from './midi'
import * as midiJson from './../tests/midi1.json'
import { IMidiFile } from 'midi-json-parser-worker'

describe('getMidiInfos()', () => {
    it('should extract midi file infos from midi json', () => {
        const midi = midiJson as IMidiFile
        const expectedResult = {
            format: 1,
            initialChannelInstruments: new Map().set(0, 'Bright Acoustic Keyboard'),
            midiDuration: 152999.267578125,
            msPerBeat: 750,
            playableTracksIndexes: [1],
            ticksPerBeat: 1024,
        }

        expect(getMidiInfos(midi)).toStrictEqual(expectedResult)
    })
})
