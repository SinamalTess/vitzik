import React from 'react'
import uniqBy from 'lodash/uniqBy'
import isEqual from 'lodash/isEqual'
import { ActiveInstrument, ActiveNote, MidiMetas } from '../../../../types'
import { SectionOfEvents, VisualizerEvent } from '../../types'
import { useIntervalWorker } from '../../../../hooks'
import {
    activeInstrumentsToInstruments,
    instrumentsToActiveInstruments,
    KEYBOARD_CHANNEL,
    MIDI_INPUT_CHANNEL,
} from '../../../../utils/const'
import { EventManagerFactory } from '../../utils/EventManagerFactory'
import { MidiVisualizerConfig } from '../../../../types/MidiVisualizerConfig'

interface EventManagerProps {
    midiMetas: MidiMetas
    config: MidiVisualizerConfig
    activeInstruments: ActiveInstrument[]
    data: SectionOfEvents[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
}

const isUserChannel = (channel: number) => [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)

export function EventManager({
    midiMetas,
    activeInstruments,
    data,
    config,
    onChangeActiveNotes,
    onChangeActiveInstruments,
    onChangeNextNoteStartingTime,
}: EventManagerProps) {
    const { msPerSection, height, showDampPedal, loopTimestamps } = config
    const { instruments } = midiMetas
    const visualizerFactory = new EventManagerFactory(msPerSection, height)
    const midiTrackActiveInstruments = activeInstruments.filter(
        ({ channel }) => !isUserChannel(channel)
    )
    const midiTrackInstruments = activeInstrumentsToInstruments(midiTrackActiveInstruments)
    const isMultiInstrumentsTrack = instruments.some(({ timestamp }) => timestamp > 0)

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        setActiveNotes(time)
        setNextNoteStartingTime(time)

        if (isMultiInstrumentsTrack) {
            setActiveInstruments(time)
        }

        if (showDampPedal) {
            const events = getEvents(time)
            const hasDampPedalEvents = events.some((event) => event.eventType === 'dampPedal')

            if (events.length && hasDampPedalEvents) {
                setDampPedal(time, events)
            }
        }
    }

    function getEvents(time: number) {
        const newIndexesToDraw = visualizerFactory.getIndexesSectionToDraw(time)

        return [
            ...visualizerFactory.getEventsBySectionIndex(data, newIndexesToDraw[0]),
            ...visualizerFactory.getEventsBySectionIndex(data, newIndexesToDraw[1]),
        ]
    }

    function setDampPedal(time: number, events: VisualizerEvent[]) {
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

    function setActiveInstruments(time: number) {
        const newInstruments = getNewInstruments(time)
        const hasNewInstruments = !isEqual(newInstruments, midiTrackInstruments)
        const activeInstruments = instrumentsToActiveInstruments(newInstruments)

        if (hasNewInstruments) {
            onChangeActiveInstruments(activeInstruments)
        }
    }

    function getNewInstruments(time: number) {
        const allInstruments = [...instruments]
            .filter(({ timestamp }) => timestamp <= time)
            .sort((a, b) => b.delta - a.delta) // sort by largest delta first

        return uniqBy(allInstruments, 'channel')
    }

    function setNextNoteStartingTime(time: number) {
        const [startLoop] = loopTimestamps
        const startTime = startLoop ? startLoop - 1 : time
        const nextNoteStartingTime = visualizerFactory.getNextNoteStartingTime(data, startTime)

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
