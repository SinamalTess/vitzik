import { IMidiFile } from 'midi-json-parser-worker'
import {
    InstrumentUserFriendlyName,
    MidiMetas,
    TrackMetas,
    MsPerBeat,
    AlphabeticalNote,
    Instrument,
} from '../types'
import { DRUM_KIT_CHANNEL, MIDI_INSTRUMENTS } from '../const'
import { keyToNote } from './notes'
import {
    isKeySignatureEvent,
    isNoteOnEvent,
    isProgramChangeEvent,
    isSetTempoEvent,
    isTimeSignatureEvent,
    isTrackNameEvent,
} from './midi_events'
import assign from 'lodash/assign'
import last from 'lodash/last'
import sortBy from 'lodash/sortBy'
import { MidiFactory } from './MidiFactory'
import { IMidiProgramChangeEvent } from 'midi-json-parser-worker/src/interfaces'

const programNumberToInstrumentName = (
    channel: number,
    programNumber: number
): InstrumentUserFriendlyName => {
    if (channel === DRUM_KIT_CHANNEL) {
        return 'Drum Kit'
    } else {
        return MIDI_INSTRUMENTS[programNumber]
    }
}

const getInstrument = (event: IMidiProgramChangeEvent, deltaAcc: number) => {
    const { channel } = event
    const actualChannel = channel + 1
    const { programNumber } = event.programChange
    const name = programNumberToInstrumentName(actualChannel, programNumber)

    return {
        channel: actualChannel,
        delta: deltaAcc,
        timestamp: 0, // to be replaced once we know allMsPerBeat values
        name,
        index: programNumber,
        notes: new Set(),
    } as Instrument
}

export function getMidiMetas(midiJson: IMidiFile): MidiMetas {
    let tracksMetas: TrackMetas[] = []
    let instruments: Instrument[] = []
    let allMsPerBeat: MsPerBeat[] = []
    const midiFactory = new MidiFactory(midiJson)
    const ticksPerBeat = midiFactory.getTicksPerBeat()

    midiJson.tracks.forEach((track, index) => {
        let deltaAcc = 0
        let trackMetas: TrackMetas = {
            index,
            nbTicks: deltaAcc,
            channels: new Set<number>(),
            isPlayable: false,
            names: [],
            msPerBeat: [],
        }

        const isPlayable = MidiFactory.Track(track).isPlayable()

        if (isPlayable) {
            assign(trackMetas, {
                isPlayable: true,
            })
        }

        track.forEach((event) => {
            deltaAcc = deltaAcc + event.delta

            assign(trackMetas, {
                nbTicks: deltaAcc,
            })

            if (isProgramChangeEvent(event)) {
                const instrument = getInstrument(event, deltaAcc)
                instruments.push(instrument)
            }

            if (isNoteOnEvent(event)) {
                const { channel } = event
                const actualChannel = channel + 1

                assign(trackMetas, {
                    channels: trackMetas.channels.add(actualChannel),
                })

                // Finds instrument playing the note
                const instrument = instruments
                    .sort((a, b) => b.delta - a.delta) // sort by largest delta first
                    .find(({ delta, channel }) => delta <= deltaAcc && channel === actualChannel)

                if (instrument) {
                    instrument.notes.add(keyToNote(event.noteOn.noteNumber) as AlphabeticalNote)
                }
            }

            if (isTrackNameEvent(event)) {
                assign(trackMetas, {
                    names: [...trackMetas.names, event.trackName],
                })
            }

            if (isSetTempoEvent(event)) {
                const { microsecondsPerQuarter: microSPerBeat } = event.setTempo
                const lastMsPerBeat = last(trackMetas.msPerBeat)
                const newMsPerBeatValue = MidiFactory.Time().microSPerBeatToMsPerBeat(microSPerBeat)
                let newTimestamp = (deltaAcc / ticksPerBeat) * newMsPerBeatValue

                if (lastMsPerBeat) {
                    const { value, delta, timestamp } = lastMsPerBeat
                    newTimestamp = ((deltaAcc - delta) / ticksPerBeat) * value + timestamp
                }

                const msPerBeat = {
                    value: newMsPerBeatValue,
                    timestamp: newTimestamp,
                    delta: deltaAcc,
                }

                assign(trackMetas, {
                    msPerBeat: [...trackMetas.msPerBeat, msPerBeat],
                })

                allMsPerBeat.push(msPerBeat)
            }

            if (isTimeSignatureEvent(event)) {
                const { timeSignature } = event

                assign(trackMetas, {
                    timeSignature,
                })
            }

            if (isKeySignatureEvent(event)) {
                const { keySignature } = event

                assign(trackMetas, {
                    keySignature,
                })
            }
        })

        tracksMetas.push(trackMetas)
    })

    const instrumentsWithNotes = instruments.filter((instrument) => instrument.notes.size)
    const instrumentsWithTimestamp = instrumentsWithNotes.map((instrument) => {
        const { delta } = instrument
        // calculates final timestamp of instruments
        return {
            ...instrument,
            timestamp: MidiFactory.Time().deltaToTimestamp(allMsPerBeat, delta, ticksPerBeat),
        }
    })

    return {
        ticksPerBeat,
        midiDuration: midiFactory.getDuration(allMsPerBeat),
        format: midiFactory.getFormat(),
        instruments: sortBy(instrumentsWithTimestamp, 'delta'),
        tracksMetas,
        allMsPerBeat: sortBy(allMsPerBeat, 'delta'),
    }
}
