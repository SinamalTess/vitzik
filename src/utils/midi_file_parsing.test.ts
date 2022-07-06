import {
    getInitialMsPerBeat,
    getMidiDuration,
    getMidiMetas,
    getNbTicksInTrack,
    isTrackPlayable,
} from './midi_file_parsing'
import * as midi from './../tests/midi1.json'
import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker'
import { MidiMetas, MsPerBeat } from '../types'

describe('getMidiMetas()', () => {
    it('should extract midi file infos from midi json', () => {
        const midiJson = midi as IMidiFile
        const expectedResult: MidiMetas = {
            allMsPerBeat: [
                {
                    delta: 2052,
                    timestamp: 1541.00390625,
                    value: 769,
                },
                {
                    delta: 2308,
                    timestamp: 1733.25390625,
                    value: 750,
                },
            ],
            format: 1,
            initialInstruments: [{ index: 1, name: 'Bright Acoustic Keyboard', channel: 0 }],
            midiDuration: 153042.091796875,
            ticksPerBeat: 1024,
            tracksMetas: [
                {
                    index: 0,
                    keySignature: {
                        key: 1,
                        scale: 0,
                    },
                    msPerBeat: [
                        {
                            delta: 2052,
                            timestamp: 1541.00390625,
                            value: 769,
                        },
                        {
                            delta: 2308,
                            timestamp: 1733.25390625,
                            value: 750,
                        },
                    ],
                    nbTicks: 35075,
                    timeSignature: {
                        denominator: 4,
                        metronome: 24,
                        numerator: 4,
                        thirtyseconds: 8,
                    },
                    isPlayable: false,
                    channels: [],
                },
                {
                    index: 1,
                    names: ['Piano'],
                    nbTicks: 208895,
                    isPlayable: false,
                    channels: [],
                },
            ],
        }

        expect(getMidiMetas(midiJson)).toStrictEqual(expectedResult)
    })
})

describe('isTrackPlayable()', () => {
    it('should return `true` if the provided track contains notes', () => {
        const track: TMidiEvent[] = [
            {
                noteOn: {
                    noteNumber: 55,
                    velocity: 62,
                },
                channel: 0,
                delta: 221,
            },
            {
                noteOff: {
                    noteNumber: 59,
                    velocity: 0,
                },
                channel: 0,
                delta: 29,
            },
        ]

        expect(isTrackPlayable(track)).toBe(true)
    })

    it("should return `false` if the provided track doesn't notes", () => {
        const track: TMidiEvent[] = [
            {
                setTempo: {
                    microsecondsPerQuarter: 750189,
                },
                delta: 256,
            },
            {
                endOfTrack: true,
                delta: 32767,
            },
        ]

        expect(isTrackPlayable(track)).toBe(false)
    })
})

describe('getNbTicksInTrack()', () => {
    it('should return the number of ticks (= delta sum) in a track', () => {
        const track: TMidiEvent[] = [
            {
                noteOn: {
                    noteNumber: 55,
                    velocity: 62,
                },
                channel: 0,
                delta: 0,
            },
            {
                noteOff: {
                    noteNumber: 59,
                    velocity: 0,
                },
                channel: 0,
                delta: 50,
            },
        ]

        expect(getNbTicksInTrack(track)).toBe(50)
    })
})

describe('getMidiDuration()', () => {
    it('should return the total duration of a midi file', () => {
        const allMsPerBeats: MsPerBeat[] = [
            {
                timestamp: 0,
                value: 500,
                delta: 0,
            },
            {
                timestamp: 0,
                value: 600,
                delta: 0,
            },
            {
                timestamp: 600,
                value: 850,
                delta: 50,
            },
        ]

        const nbTicks = 500
        const ticksPerBeat = 50

        expect(getMidiDuration(allMsPerBeats, nbTicks, ticksPerBeat)).toBe(8250)
    })
})

describe('getInitialMsPerBeat()', () => {
    it('should return the number of ticks (= delta sum) in a track', () => {
        const allMsPerBeats: MsPerBeat[] = [
            {
                timestamp: 0,
                value: 500,
                delta: 0,
            },
            {
                timestamp: 0,
                value: 600,
                delta: 0,
            },
            {
                timestamp: 1000,
                value: 850,
                delta: 50,
            },
        ]

        expect(getInitialMsPerBeat(allMsPerBeats)).toBe(600)
    })
})
