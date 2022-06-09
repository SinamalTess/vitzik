import { IMidiFile, IMidiSetTempoEvent } from 'midi-json-parser-worker'
import { MidiTrackInfos } from '../components/Visualizer'
import { MidiJsonNote } from '../types'

// TODO: we should use only one track here
export const midiJsonToNotes = (midiJson: IMidiFile): MidiJsonNote[] => {
    let notesArr: MidiJsonNote[] = []
    midiJson.tracks.forEach((track) => {
        const notes = track.filter(
            (event) => event.hasOwnProperty('noteOn') || event.hasOwnProperty('noteOff')
        ) as MidiJsonNote[]
        if (notes.length) {
            notesArr.push(...notes)
        }
    })

    return notesArr
}

export const getTicksPerBeat = (midiJson: IMidiFile) => {
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

export const getFormat = (midiJson: IMidiFile): number => midiJson.format

export const getMsPerBeat = (midiJson: IMidiFile): number => {
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

export const getMidiInfos = (midiJson: IMidiFile | null): MidiTrackInfos | null => {
    if (!midiJson) return null

    const notes = midiJsonToNotes(midiJson)
    const nbTicks = notes.reduce((acc, nextNote) => acc + nextNote.delta, 0)
    const ticksPerBeat = getTicksPerBeat(midiJson)
    const nbBeats = nbTicks / ticksPerBeat
    const msPerBeat = getMsPerBeat(midiJson)

    return {
        notes,
        msPerBeat,
        ticksPerBeat,
        trackDuration: nbBeats * msPerBeat,
    }
}

export const normalizeVelocity = (val: number, max: number, min: number): number =>
    (val - min) / (max - min)
