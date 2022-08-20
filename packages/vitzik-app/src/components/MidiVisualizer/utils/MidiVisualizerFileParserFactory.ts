import { IMidiFile, IMidiNoteOffEvent, IMidiNoteOnEvent } from 'midi-json-parser-worker'
import { MidiVisualizerNoteEvent } from './MidiVisualizerEvents'
import {
    isNoteOffEvent as checkIsNoteOffEvent,
    isNoteOnEvent as checkIsNoteOnEvent,
    MidiFactory,
} from '../../../utils'
import { MidiVisualizerEventsFactory } from './MidiVisualizerEventsFactory'
import { MsPerBeat } from '../../../types'

export interface SectionNoteCoordinates {
    [sectionIndex: number]: MidiVisualizerNoteEvent[]
}

export class MidiVisualizerFileParserFactory extends MidiVisualizerEventsFactory {
    notesBeingProcessed: MidiVisualizerNoteEvent[]
    width: number
    height: number
    ratioSection: number
    allMsPerBeat: MsPerBeat[]
    ticksPerBeat: number
    msPerSection: number
    msPerBeatValue: number

    constructor(
        containerDimensions: {
            height: number
            width: number
        },
        msPerSection: number,
        midiMetas: {
            allMsPerBeat: MsPerBeat[]
            ticksPerBeat: number
        }
    ) {
        super(containerDimensions, msPerSection, midiMetas)

        this.width = containerDimensions.width
        this.height = containerDimensions.height
        this.allMsPerBeat = midiMetas.allMsPerBeat
        this.ratioSection = this.height / msPerSection
        this.ticksPerBeat = midiMetas.ticksPerBeat
        this.msPerSection = msPerSection
        this.msPerBeatValue = MidiFactory.Time().getInitialMsPerBeatValue(midiMetas.allMsPerBeat)
        this.notesBeingProcessed = []
    }

    private processNoteOnEvent = (event: IMidiNoteOnEvent, deltaAcc: number) => {
        const partialMidiVisualizerNoteEvent = this.getPartialMidiVisualizerNoteEvent(
            event,
            deltaAcc
        )

        this.notesBeingProcessed.push(partialMidiVisualizerNoteEvent)
    }

    private processNoteOffEvent = (
        event: IMidiNoteOffEvent | IMidiNoteOnEvent,
        deltaAcc: number,
        notesCoordinatesInTrack: SectionNoteCoordinates[]
    ) => {
        const key = MidiFactory.Note(event).getKey()
        const partialMidiVisualizerNoteEventIndex = this.notesBeingProcessed.findIndex(
            (note) => note.key === key
        )

        if (partialMidiVisualizerNoteEventIndex !== -1) {
            const partialMidiVisualizerNoteEvent = {
                ...this.notesBeingProcessed[partialMidiVisualizerNoteEventIndex],
            }
            const finalMidiVisualizerNoteEvent = this.getFinalMidiVisualizerNoteEvent(
                partialMidiVisualizerNoteEvent,
                deltaAcc
            )
            this.addNoteToSection(finalMidiVisualizerNoteEvent, notesCoordinatesInTrack)
            this.notesBeingProcessed.splice(partialMidiVisualizerNoteEventIndex, 1)
        }
    }

    private addNoteToSection = (
        note: MidiVisualizerNoteEvent,
        notesCoordinatesInTrack: SectionNoteCoordinates[]
    ) => {
        const startingSection = Math.floor(note.startingTime / this.msPerSection) // arrays start at 0, so we use floor to get number below
        const endingSection = Math.floor((note.startingTime + note.duration) / this.msPerSection)

        for (let i = startingSection; i <= endingSection; i++) {
            const indexSection = notesCoordinatesInTrack.findIndex((section) => section[i])
            if (indexSection >= 0) {
                notesCoordinatesInTrack[indexSection] = {
                    [i]: [...notesCoordinatesInTrack[indexSection][i], note],
                }
            } else {
                notesCoordinatesInTrack.push({ [i]: [note] })
            }
        }
    }

    parseMidiJson = (midiJson: IMidiFile) => {
        const { tracks } = midiJson
        let noteEvents: SectionNoteCoordinates[][] = []

        tracks.forEach((track) => {
            let deltaAcc = 0
            this.notesBeingProcessed = []
            let noteEventsInTrack: {
                [sectionIndex: number]: MidiVisualizerNoteEvent[]
            }[] = []

            track.forEach((event) => {
                deltaAcc = deltaAcc + event.delta
                const lastMsPerBeat = this.getMsPerBeatFromDelta(deltaAcc)
                const isNoteOnEvent = checkIsNoteOnEvent(event)
                const isNoteOffEvent =
                    checkIsNoteOffEvent(event) || (isNoteOnEvent && event.noteOn.velocity === 0)

                if (lastMsPerBeat && lastMsPerBeat.value !== this.msPerBeatValue) {
                    this.msPerBeatValue = lastMsPerBeat.value
                }

                if (isNoteOnEvent) {
                    this.processNoteOnEvent(event, deltaAcc)
                } else if (isNoteOffEvent) {
                    this.processNoteOffEvent(event, deltaAcc, noteEventsInTrack)
                }
            })

            noteEvents.push(noteEventsInTrack)
        })

        return noteEvents
    }
}
