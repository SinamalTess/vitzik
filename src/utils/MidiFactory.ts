import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker'
import { isPositive } from './maths'
import max from 'lodash/max'
import { Instrument, MidiJsonNote, MsPerBeat } from '../types'
import last from 'lodash/last'
import { MidiNoteFactory } from './MidiNoteFactory'
import { MidiTrackFactory } from './MidiTrackFactory'
import { MidiTimeFactory } from './MidiTimeFactory'
import uniqBy from 'lodash/uniqBy'

export class MidiFactory {
    midiJson: IMidiFile
    ticksPerBeat: number
    constructor(midiJson: IMidiFile) {
        this.midiJson = midiJson
        this.ticksPerBeat = this.getTicksPerBeat()
    }

    getFormat = () => this.midiJson.format

    getDivision = () => this.midiJson.division

    getTicksPerBeat = () => {
        const division = this.getDivision()
        if (isPositive(division)) {
            // The "division" is equal to the ticks per beat (beat = quarter note)
            return division
        } else {
            // The file is using SMPTE units (ticks per frame)
            throw new Error(
                'Congratulations you have found a SMPTE formatted midi file, a rare gem, I have no idea how to process it...yet'
            )
        }
    }

    getNbTicks = () => {
        const nbTicksPerTrack = this.midiJson.tracks.map((track) =>
            MidiFactory.Track(track).getNbTicks()
        )
        return max(nbTicksPerTrack) ?? 0 // TODO: this would only work for format 0 and 1
    }

    getDuration(allMsPerBeat: MsPerBeat[]) {
        const lastMsPerBeat = last(allMsPerBeat)
        const nbTicks = this.getNbTicks()

        if (lastMsPerBeat) {
            const { value, timestamp, delta } = lastMsPerBeat
            const timeLeft = ((nbTicks - delta) / this.ticksPerBeat) * value
            return timestamp + timeLeft
        }

        return 0
    }

    static getInitialInstruments = (instruments: Instrument[]) =>
        uniqBy(instruments, 'channel').filter(({ timestamp }) => timestamp <= 0)

    static Note = (note: MidiJsonNote) => new MidiNoteFactory(note)
    static Track = (track: TMidiEvent[]) => new MidiTrackFactory(track)
    static Time = () => new MidiTimeFactory()
}
