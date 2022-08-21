import React, { useContext } from 'react'
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
import { isUserChannel } from './MidiVisualizer'
import { VisualizerFactory } from './utils'
import { SectionNoteEvents } from './types'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'
import { AppContext } from '../_contexts'

interface MidiEventsManagerProps {
    midiMetas: MidiMetas
    midiMode: MidiPlayMode
    loopTimestamps?: LoopTimestamps
    timeToNextNote: number | null
    visualizerFactory: VisualizerFactory
    activeInstruments: Instrument[]
    activeTracksNoteEvents: SectionNoteEvents[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

export function MidiEventsManager({
    midiMetas,
    activeInstruments,
    loopTimestamps,
    visualizerFactory,
    midiMode,
    timeToNextNote,
    activeTracksNoteEvents,
    onChangeActiveNotes,
    onChangeInstruments,
    onChangeTimeToNextNote,
    onChangeAudioPlayerState,
}: MidiEventsManagerProps) {
    const midiTrackInstruments = activeInstruments.filter(({ channel }) => !isUserChannel(channel))
    const { instruments } = midiMetas
    const isMultiInstrumentsTrack = instruments.some(({ timestamp }) => timestamp > 0)
    const { intervalWorker } = useContext(AppContext)

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        checkIsEndOfSong(time)
        setActiveNotes(time)
        checkForWaitMode(time)
        if (midiMode === 'waitForValidInput') {
            setTimeToNextNote(time)
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

    function checkIsEndOfSong(time: number) {
        if (time > midiMetas.midiDuration) {
            onChangeAudioPlayerState('stopped')
        }
    }

    function checkIsEndOfLoop(time: number) {
        const [startLoop, endLoop] = loopTimestamps as LoopTimestamps
        if (startLoop && endLoop && time > endLoop) {
            intervalWorker?.postMessage({
                code: 'updateTimer',
                startAt: startLoop - 200 ?? 0,
            })
        }
    }

    function checkForWaitMode(time: number) {
        // in `wait` mode we pause until the user hits the right keys
        if (timeToNextNote && time >= timeToNextNote) {
            onChangeAudioPlayerState('paused')
        }
    }

    function getInstruments(time: number) {
        const allInstruments = [...instruments]
            .filter(({ timestamp }) => timestamp <= time)
            .sort((a, b) => b.delta - a.delta) // sort by largest delta first

        return uniqBy(allInstruments, 'channel')
    }

    function setTimeToNextNote(time: number) {
        const timeToNextNote = visualizerFactory.getTimeToNextNote(activeTracksNoteEvents, time)
        onChangeTimeToNextNote(timeToNextNote)
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
