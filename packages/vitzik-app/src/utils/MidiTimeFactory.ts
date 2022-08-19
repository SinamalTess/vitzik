import { MsPerBeat } from '../types'
import findLast from 'lodash/findLast'
import { MidiFactory } from './MidiFactory'

export class MidiTimeFactory {
    beatsPerMinToMsPerBeat = (beatsPerMin: number) => (60 * 1000) / beatsPerMin

    deltaToMsPerBeat = (delta: number, allMsPerBeat: MsPerBeat[]) =>
        findLast(allMsPerBeat, (msPerBeat) => msPerBeat.delta <= delta)

    deltaToTimestamp(allMsPerBeat: MsPerBeat[], delta: number, ticksPerBeat: number) {
        const lastMsPerBeat = MidiFactory.Time().deltaToMsPerBeat(delta, allMsPerBeat)

        if (lastMsPerBeat) {
            const { timestamp, delta: lastDelta, value } = lastMsPerBeat
            return timestamp + ((delta - lastDelta) / ticksPerBeat) * value
        }

        return 0
    }

    getInitialMsPerBeatValue(allMsPerBeats: MsPerBeat[]) {
        return allMsPerBeats.reduce((acc, value) => {
            // sometimes multiple tempo with delta = 0 exists, this returns the last
            if (acc.delta === value.delta) {
                return value
            } else {
                return acc
            }
        }).value
    }

    microSPerBeatToMsPerBeat = (microsecondsPerQuarter: number) =>
        Math.round(microsecondsPerQuarter / 1000)

    msPerBeatToBpm = (msPerBeat: number) => (1000 * 60) / msPerBeat
}
