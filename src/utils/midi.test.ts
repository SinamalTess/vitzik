import { getAllNotes } from './midi'
import { IMidiFile } from 'midi-json-parser-worker'

describe('getAllNotes()', () => {
    const midiJson: IMidiFile = {
        tracks: [
            [
                {
                    channel: 0,
                    delta: 0,
                    timeSignature: {
                        denominator: 4,
                        numerator: 4,
                        thirtyseconds: 8,
                        metronome: 4,
                    },
                },
                {
                    delta: 0,
                    channel: 0,
                    noteOn: {
                        noteNumber: 21,
                        velocity: 20,
                    },
                },
                {
                    delta: 50,
                    channel: 0,
                    noteOff: {
                        noteNumber: 21,
                        velocity: 0,
                    },
                },
            ],
        ],
        division: 0,
        format: 0,
    }
    test('converts a midi json input to an array of notes', () => {
        expect(getAllNotes(midiJson)).toStrictEqual([
            {
                delta: 0,
                channel: 0,
                noteOn: {
                    noteNumber: 21,
                    velocity: 20,
                },
            },
            {
                delta: 50,
                channel: 0,
                noteOff: {
                    noteNumber: 21,
                    velocity: 0,
                },
            },
        ])
    })
})
