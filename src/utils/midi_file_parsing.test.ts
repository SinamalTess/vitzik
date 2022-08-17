import { getMidiMetas } from './midi_file_parsing'
import * as midi from './../tests/midi1.json'
import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker'
import { MidiMetas, MsPerBeat } from '../types'
import { MidiFactory } from './MidiFactory'

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
            instruments: [
                {
                    index: 1,
                    name: 'Bright Acoustic Keyboard',
                    channel: 0,
                    notes: new Set([
                        'D5',
                        'G5',
                        'B5',
                        'B4',
                        'G4',
                        'D4',
                        'B3',
                        'G3',
                        'D3',
                        'C5',
                        'F5',
                        'A5',
                        'A4',
                        'F4',
                        'C4',
                        'A3',
                        'F3',
                        'C3',
                        'Bb4',
                        'Eb5',
                        'Eb4',
                        'Bb3',
                        'Eb3',
                        'Bb2',
                        'Gb5',
                        'Gb4',
                        'E5',
                        'E4',
                        'Db5',
                        'Ab5',
                        'Ab4',
                        'Db4',
                    ]),
                    delta: 0,
                    timestamp: 0,
                },
            ],
            midiDuration: 153042.091796875,
            ticksPerBeat: 1024,
            tracksMetas: [
                {
                    index: 0,
                    names: [],
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
                    channels: new Set(),
                },
                {
                    index: 1,
                    names: ['Piano'],
                    msPerBeat: [],
                    nbTicks: 208895,
                    isPlayable: true,
                    channels: new Set([0]),
                },
            ],
        }

        expect(getMidiMetas(midiJson)).toStrictEqual(expectedResult)
    })
})

describe('MidiFactory.Track().isPlayable()', () => {
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

        expect(MidiFactory.Track(track).isPlayable()).toBe(true)
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

        expect(MidiFactory.Track(track).isPlayable()).toBe(false)
    })
})

describe('MidiFactory.Track.getNbTicks()', () => {
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

        expect(MidiFactory.Track(track).getNbTicks()).toBe(50)
    })
})

describe('getMidiDuration()', () => {
    it('should return the total duration of a midi file', () => {
        const midiJson = midi as IMidiFile
        const midiFactory = new MidiFactory(midiJson)
        const allMsPerBeats = getMidiMetas(midiJson).allMsPerBeat

        expect(midiFactory.getDuration(allMsPerBeats)).toBe(153042.091796875)
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

        expect(MidiFactory.Time().getInitialMsPerBeatValue(allMsPerBeats)).toBe(600)
    })
})
