import React, { useContext, useEffect, useRef } from 'react'
import uniqBy from 'lodash/uniqBy'
import isEqual from 'lodash/isEqual'
import {
    ActiveNote,
    AudioPlayerState,
    Instrument,
    LoopTimestamps,
    MidiMetas,
    MidiPlayMode,
} from '../../types'
import { VisualizerFactory } from './utils'
import { SectionOfEvents } from './types'
import { useIntervalWorker } from '../../hooks'
import { AppContext } from '../_contexts'
import { KEYBOARD_CHANNEL, MIDI_INPUT_CHANNEL } from '../../utils/const'

interface MidiEventsManagerProps {
    midiMetas: MidiMetas
    midiPlayMode: MidiPlayMode
    loopTimestamps?: LoopTimestamps
    nextNoteStartingTime: number | null
    visualizerFactory: VisualizerFactory
    activeInstruments: Instrument[]
    activeTracksNoteEvents: SectionOfEvents[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

const isUserChannel = (channel: number) => [MIDI_INPUT_CHANNEL, KEYBOARD_CHANNEL].includes(channel)

export function MidiEventsManager({
    midiMetas,
    activeInstruments,
    loopTimestamps,
    visualizerFactory,
    midiPlayMode,
    nextNoteStartingTime,
    activeTracksNoteEvents,
    onChangeActiveNotes,
    onChangeInstruments,
    onChangeNextNoteStartingTime,
    onChangeAudioPlayerState,
}: MidiEventsManagerProps) {
    const midiTrackInstruments = activeInstruments.filter(({ channel }) => !isUserChannel(channel))
    const { instruments } = midiMetas
    const isMultiInstrumentsTrack = instruments.some(({ timestamp }) => timestamp > 0)
    const { intervalWorker } = useContext(AppContext)
    const timeRef = useRef(0)

    useEffect(() => {
        switch (midiPlayMode) {
            case 'autoplay':
                onChangeNextNoteStartingTime(null)
                break
            case 'waitForValidInput':
                setNextNoteStartingTime(timeRef.current)
                const activeNotes = visualizerFactory.getActiveNotes(
                    activeTracksNoteEvents,
                    timeRef.current
                )
                if (!activeNotes.length) {
                    moveToNextNote()
                }
                break
        }
    }, [midiPlayMode])

    function moveToNextNote() {
        const nextNoteStartingTime = visualizerFactory.getNextNoteStartingTime(
            activeTracksNoteEvents,
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
            if (hasNewInstruments) {
                onChangeInstruments(instruments)
            }
        }
        if (loopTimestamps) {
            checkIsEndOfLoop(time)
        }
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
        const nextNoteStartingTime = visualizerFactory.getNextNoteStartingTime(
            activeTracksNoteEvents,
            time
        )
        onChangeNextNoteStartingTime(nextNoteStartingTime)
    }

    function setActiveNotes(time: number) {
        const newActiveNotes = visualizerFactory.getActiveNotes(activeTracksNoteEvents, time)

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
