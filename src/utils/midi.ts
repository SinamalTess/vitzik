import { IMidiFile, IMidiSetTempoEvent } from 'midi-json-parser-worker'
import { MidiTrackInfos } from '../types'

export const getFormat = (midiJson: IMidiFile): number => midiJson.format

export function getTicksPerBeat(midiJson: IMidiFile) {
    const { division } = midiJson
    const value = Math.sign(division)
    const isTickPerBeat = value === 0 || value === 1

    if (isTickPerBeat) {
        console.log(
            `The file is using ticks per beat, there are ${division} ticks per beat (quarter note)`
        )
    } else {
        console.log(`The file is using SMPTE units`) // TODO: complete this section
    }

    return division
}

export function getMsPerBeat(midiJson: IMidiFile): number {
    const format = getFormat(midiJson)
    const defaultTempo = 60000 / 120 // 120 beats per minute is the default value
    switch (format) {
        case 0: // TODO: complete this section
            return defaultTempo
        case 1:
            const setTempoEvents = midiJson.tracks[0].filter((event) =>
                event.hasOwnProperty('setTempo')
            ) as IMidiSetTempoEvent[]

            if (setTempoEvents.length > 1) {
                const lastSetTempo = setTempoEvents[setTempoEvents.length - 1]
                const { microsecondsPerQuarter } = lastSetTempo.setTempo
                const msPerBeat = Math.round(microsecondsPerQuarter / 1000)

                console.log(`There are ${msPerBeat} milliseconds per quarter note (beat)`)

                return msPerBeat
            }

            return defaultTempo

        case 2: // TODO: complete this section
            return defaultTempo
        default:
            return defaultTempo
    }
}

export function getMidiInfos(midiJson: IMidiFile | null): MidiTrackInfos | null {
    if (!midiJson) return null

    const nbTicks = midiJson.tracks[0].reduce((acc, nextEvent) => acc + nextEvent.delta, 0) //TODO: check if all track last the same
    const ticksPerBeat = getTicksPerBeat(midiJson)
    const nbBeats = nbTicks / ticksPerBeat
    const msPerBeat = getMsPerBeat(midiJson)

    return {
        msPerBeat,
        ticksPerBeat,
        trackDuration: nbBeats * msPerBeat,
    }
}
