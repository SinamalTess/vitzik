import { IMidiFile, IMidiSetTempoEvent } from 'midi-json-parser-worker'
import { MidiTrackInfos } from '../components/Visualizer'
import { MidiJsonNote } from '../types'

export function midiJsonToNotes(midiJson: IMidiFile): MidiJsonNote[] {
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

export function getFormat(midiJson: IMidiFile) {
    return midiJson.format
}

export function getTempo(midiJson: IMidiFile) {
    const format = getFormat(midiJson)
    switch (format) {
        case 0: // TODO: complete this section
        case 1:
            const setTempoEvents = midiJson.tracks[0].filter((event) =>
                event.hasOwnProperty('setTempo')
            ) as IMidiSetTempoEvent[]
            const lastSetTempo = setTempoEvents[setTempoEvents.length - 1]
            const { microsecondsPerQuarter } = lastSetTempo.setTempo
            const msPerBeat = Math.round(microsecondsPerQuarter / 1000)

            console.log(`There are ${msPerBeat} milliseconds per quarter note (beat)`)

            return msPerBeat
        case 2: // TODO: complete this section
        default:
    }

    return 0
}

export function getMidiInfos(midiJson: IMidiFile): MidiTrackInfos {
    const notes = midiJsonToNotes(midiJson)
    const nbTicks = notes.reduce((acc, nextNote) => acc + nextNote.delta, 0)
    const ticksPerBeat = getTicksPerBeat(midiJson)
    const nbBeats = nbTicks / ticksPerBeat
    const msPerBeat = getTempo(midiJson)
    return {
        msPerBeat,
        ticksPerBeat,
        trackDuration: nbBeats * msPerBeat,
    }
}
