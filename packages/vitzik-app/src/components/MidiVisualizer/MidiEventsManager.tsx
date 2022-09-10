import React, { useContext, useEffect, useRef } from 'react'
import uniqBy from 'lodash/uniqBy'
import isEqual from 'lodash/isEqual'
import {
    ActiveInstrument,
    ActiveNote,
    AudioPlayerState,
    LoopTimestamps,
    MidiMetas,
    MidiPlayMode,
} from '../../types'
import { SectionOfEvents, VisualizerEvent } from './types'
import { useIntervalWorker } from '../../hooks'
import { AppContext } from '../_contexts'
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
    midiPlayMode: MidiPlayMode
    loopTimestamps?: LoopTimestamps
    nextNoteStartingTime: number | null
    activeInstruments: ActiveInstrument[]
    data: SectionOfEvents[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

const isUserChannel = (channel: number) => [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)

export function MidiEventsManager({
    midiMetas,
    activeInstruments,
    loopTimestamps,
    midiPlayMode,
    nextNoteStartingTime,
    data,
    config,
    onChangeActiveNotes,
    onChangeActiveInstruments,
    onChangeNextNoteStartingTime,
    onChangeAudioPlayerState,
}: MidiEventsManagerProps) {
    const midiTrackActiveInstruments = activeInstruments.filter(
        ({ channel }) => !isUserChannel(channel)
    )
    const midiTrackInstruments = activeInstrumentsToInstruments(midiTrackActiveInstruments)
    const { msPerSection, height, showDampPedal } = config

    const { instruments } = midiMetas
    const isMultiInstrumentsTrack = instruments.some(({ timestamp }) => timestamp > 0)
    const { intervalWorker } = useContext(AppContext)
    const timeRef = useRef(0)
    const visualizerFactory = new VisualizerEventManager(msPerSection, height)

    useEffect(() => {
        switch (midiPlayMode) {
            case 'autoplay':
                onChangeNextNoteStartingTime(null)
                break
            case 'waitForValidInput':
                setNextNoteStartingTime(timeRef.current)
                const activeNotes = visualizerFactory.getActiveNotes(data, timeRef.current)
                if (!activeNotes.length) {
                    moveToNextNote()
                }
                break
        }
    }, [midiPlayMode])

    function moveToNextNote() {
        const nextNoteStartingTime = visualizerFactory.getNextNoteStartingTime(
            data,
            timeRef.current
        )
        if (nextNoteStartingTime) {
            intervalWorker?.updateTimer(nextNoteStartingTime)
        }
    }

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number, interval: number) {
        timeRef.current = time
        setActiveNotes(time)
        if (midiPlayMode === 'waitForValidInput') {
            checkForWaitMode(time, interval)
            setNextNoteStartingTime(time)
        }
        if (isMultiInstrumentsTrack) {
            const instruments = getInstruments(time)
            const hasNewInstruments = !isEqual(instruments, midiTrackInstruments)
            const activeInstruments = instrumentsToActiveInstruments(instruments)
            if (hasNewInstruments) {
                onChangeActiveInstruments(activeInstruments)
            }
        }
        if (loopTimestamps) {
            checkIsEndOfLoop(time)
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

    function checkIsEndOfLoop(time: number) {
        const [startLoop, endLoop] = loopTimestamps as LoopTimestamps
        if (startLoop && endLoop && time > endLoop) {
            const startAt = startLoop - 200 ?? 0
            intervalWorker?.updateTimer(startAt)
            onChangeAudioPlayerState('paused')
        }
    }

    function checkForWaitMode(time: number, interval: number) {
        if (!nextNoteStartingTime) return

        const nextTick = time + interval

        if (time >= nextNoteStartingTime || nextTick >= nextNoteStartingTime) {
            intervalWorker?.updateTimer(nextNoteStartingTime)
            onChangeAudioPlayerState('paused')
        }
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
