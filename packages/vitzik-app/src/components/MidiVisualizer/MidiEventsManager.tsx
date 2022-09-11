import React, { useRef } from 'react'
import uniqBy from 'lodash/uniqBy'
import isEqual from 'lodash/isEqual'
import { ActiveInstrument, ActiveNote, MidiMetas } from '../../types'
import { SectionOfEvents, VisualizerEvent } from './types'
import { useIntervalWorker } from '../../hooks'
import {
    activeInstrumentsToInstruments,
    instrumentsToActiveInstruments,
    KEYBOARD_CHANNEL,
    MIDI_INPUT_CHANNEL,
} from '../../utils/const'
import { VisualizerEventManager } from './utils/VisualizerEventManager'
import { MidiVisualizerConfig } from '../../types/MidiVisualizerConfig'

interface MidiEventsManagerProps {
    midiMetas: MidiMetas
    config: MidiVisualizerConfig
    activeInstruments: ActiveInstrument[]
    data: SectionOfEvents[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
}

const isUserChannel = (channel: number) => [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)

export function MidiEventsManager({
    midiMetas,
    activeInstruments,
    data,
    config,
    onChangeActiveNotes,
    onChangeActiveInstruments,
    onChangeNextNoteStartingTime,
}: MidiEventsManagerProps) {
    const midiTrackActiveInstruments = activeInstruments.filter(
        ({ channel }) => !isUserChannel(channel)
    )
    const midiTrackInstruments = activeInstrumentsToInstruments(midiTrackActiveInstruments)
    const { msPerSection, height, showDampPedal } = config

    const { instruments } = midiMetas
    const isMultiInstrumentsTrack = instruments.some(({ timestamp }) => timestamp > 0)
    const timeRef = useRef(0)
    const visualizerFactory = new VisualizerEventManager(msPerSection, height)

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        timeRef.current = time
        setActiveNotes(time)
        setNextNoteStartingTime(time)

        if (isMultiInstrumentsTrack) {
            const instruments = getInstruments(time)
            const hasNewInstruments = !isEqual(instruments, midiTrackInstruments)
            const activeInstruments = instrumentsToActiveInstruments(instruments)
            if (hasNewInstruments) {
                onChangeActiveInstruments(activeInstruments)
            }
        }

        const newIndexesToDraw = visualizerFactory.getIndexesSectionToDraw(time)

        const slidesEvents = [
            visualizerFactory.getEventsBySectionIndex(data, newIndexesToDraw[0]),
            visualizerFactory.getEventsBySectionIndex(data, newIndexesToDraw[1]),
        ]

        if ((slidesEvents[0] || slidesEvents[1]) && showDampPedal) {
            const events = slidesEvents[0].concat(slidesEvents[1])
            checkDampPedal(time, events)
        }
    }

    function checkDampPedal(time: number, events: VisualizerEvent[]) {
        const isEventActive = (event: VisualizerEvent) =>
            event.startingTime <= time && event.startingTime + event.duration > time
        const isDampPedalOn = (instrumentChannel: number) =>
            events.some(
                (event) =>
                    event.eventType === 'dampPedal' &&
                    isEventActive(event) &&
                    instrumentChannel === event.channel
            )
        onChangeActiveInstruments((activeInstruments) => {
            return activeInstruments.map((instrument) => {
                return {
                    ...instrument,
                    isDampPedalOn: isDampPedalOn(instrument.channel),
                }
            })
        })
    }

    function getInstruments(time: number) {
        const allInstruments = [...instruments]
            .filter(({ timestamp }) => timestamp <= time)
            .sort((a, b) => b.delta - a.delta) // sort by largest delta first

        return uniqBy(allInstruments, 'channel')
    }

    function setNextNoteStartingTime(time: number) {
        const nextNoteStartingTime = visualizerFactory.getNextNoteStartingTime(data, time)
        onChangeNextNoteStartingTime(nextNoteStartingTime)
    }

    function setActiveNotes(time: number) {
        const newActiveNotes = visualizerFactory.getActiveNotes(data, time)

        onChangeActiveNotes((activeNotes: ActiveNote[]) => {
            if (isEqual(newActiveNotes, activeNotes)) {
                return activeNotes
            } else {
                const userNotes = activeNotes.filter(({ channel }) => isUserChannel(channel))
                return [...newActiveNotes, ...userNotes]
            }
        })
    }

    return null
}
