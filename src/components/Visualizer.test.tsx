import { getNotesPosition, mergeNotesCoordinates } from './Visualizer'
import { getMidiInfos } from '../utils'
import { MidiInfos } from '../types'
import { IMidiFile } from 'midi-json-parser-worker'

describe('Visualizer', () => {
    describe('getNotesPosition()', () => {
        it('should compute the note position', () => {
            const singleTrackMidiJson: IMidiFile = {
                division: 1024,
                format: 1,
                tracks: [
                    [
                        {
                            noteOn: {
                                noteNumber: 74,
                                velocity: 54,
                            },
                            channel: 0,
                            delta: 0,
                        },
                        {
                            noteOff: {
                                noteNumber: 74,
                                velocity: 0,
                            },
                            channel: 0,
                            delta: 10,
                        },
                    ],
                ],
            }
            const midiInfos = getMidiInfos(singleTrackMidiJson) as MidiInfos
            const result = getNotesPosition({ w: 100, h: 100 }, singleTrackMidiJson, 10, midiInfos)
            const expectedResult = [
                [
                    [
                        {
                            channel: 0,
                            duration: 4.8828125,
                            h: 0.09765625,
                            id: 0,
                            key: 74,
                            name: 'D5',
                            velocity: 54,
                            w: 1.9230769230769231,
                            x: 59.13461538461539,
                            y: 0,
                        },
                    ],
                ],
            ]
            expect(result).toStrictEqual(expectedResult)
        })
    })
    describe('mergeNotesCoordinates()', () => {
        it('should merge the note coordinates of multiple tracks', () => {
            const multitrackMidiJson: IMidiFile = {
                division: 1024,
                format: 1,
                tracks: [
                    [
                        {
                            noteOn: {
                                noteNumber: 74,
                                velocity: 54,
                            },
                            channel: 0,
                            delta: 0,
                        },
                        {
                            noteOff: {
                                noteNumber: 74,
                                velocity: 0,
                            },
                            channel: 0,
                            delta: 10,
                        },
                    ],
                    [
                        {
                            noteOn: {
                                noteNumber: 74,
                                velocity: 54,
                            },
                            channel: 3,
                            delta: 0,
                        },
                        {
                            noteOff: {
                                noteNumber: 74,
                                velocity: 0,
                            },
                            channel: 3,
                            delta: 10,
                        },
                    ],
                ],
            }
            const midiInfos = getMidiInfos(multitrackMidiJson) as MidiInfos
            const notesPosition = getNotesPosition(
                { w: 100, h: 100 },
                multitrackMidiJson,
                10,
                midiInfos
            )
            const result = mergeNotesCoordinates([0, 1], notesPosition)
            const expectedResult = [
                [
                    {
                        channel: 0,
                        duration: 4.8828125,
                        h: 0.09765625,
                        id: 0,
                        key: 74,
                        name: 'D5',
                        velocity: 54,
                        w: 1.9230769230769231,
                        x: 59.13461538461539,
                        y: 0,
                    },
                    {
                        channel: 3,
                        duration: 4.8828125,
                        h: 0.09765625,
                        id: 0,
                        key: 74,
                        name: 'D5',
                        velocity: 54,
                        w: 1.9230769230769231,
                        x: 59.13461538461539,
                        y: 0,
                    },
                ],
            ]
            expect(result).toStrictEqual(expectedResult)
        })
    })
})
