import React, { useCallback } from 'react'
import uniqBy from 'lodash/uniqBy'
import isEqual from 'lodash/isEqual'
import { ActiveNote, Instrument, MidiMetas, MidiMode } from '../../types'
import { isUserChannel } from './MidiVisualizer'
import { MidiVisualizerFactory, SectionNoteCoordinates } from './MidiVisualizerFactory'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'

interface MidiEventsManagerProps {
    midiMetas: MidiMetas
    midiMode: MidiMode
    midiVisualizerFactory: MidiVisualizerFactory
    activeInstruments: Instrument[]
    activeTracksCoordinates: SectionNoteCoordinates[]
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeTimeToNextNote: (timeToNextNote: number | null) => void
}

export function MidiEventsManager({
    midiMetas,
    activeInstruments,
    midiVisualizerFactory,
    midiMode,
    activeTracksCoordinates,
    onChangeActiveNotes,
    onChangeInstruments,
    onChangeTimeToNextNote,
}: MidiEventsManagerProps) {
    const midiTrackInstruments = activeInstruments.filter(({ channel }) => !isUserChannel(channel))
    const { instruments } = midiMetas
    const isMultiInstrumentsTrack = instruments.some(({ timestamp }) => timestamp > 0)

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        setActiveNotes(time)
        if (midiMode === 'wait') {
            setTimeToNextNote(time)
        }
        if (isMultiInstrumentsTrack) {
            setInstruments(time)
        }
    }

    const setInstruments = useCallback(
        (time: number) => {
            const allInstruments = [...instruments]
                .filter(({ timestamp }) => timestamp <= time)
                .sort((a, b) => b.delta - a.delta) // sort by largest delta first

            const newInstruments = uniqBy(allInstruments, 'channel')

            if (!isEqual(newInstruments, midiTrackInstruments)) {
                onChangeInstruments(newInstruments)
            }
        },
        [activeInstruments, midiMetas.instruments, onChangeInstruments]
    )

    const setTimeToNextNote = useCallback(
        (time: number) => {
            const timeToNextNote = midiVisualizerFactory.getTimeToNextNote(
                activeTracksCoordinates,
                time
            )
            onChangeTimeToNextNote(timeToNextNote)
        },
        [midiMode, midiVisualizerFactory, activeTracksCoordinates, onChangeTimeToNextNote]
    )

    const setActiveNotes = useCallback(
        (time: number) => {
            const newActiveNotes = midiVisualizerFactory.getActiveNotes(
                activeTracksCoordinates,
                time
            )

            onChangeActiveNotes((activeNotes: ActiveNote[]) => {
                if (isEqual(newActiveNotes, activeNotes)) {
                    return activeNotes
                } else {
                    const userNotes = activeNotes.filter(({ channel }) => isUserChannel(channel))
                    return [...newActiveNotes, ...userNotes]
                }
            })
        },
        [midiVisualizerFactory, activeTracksCoordinates, onChangeActiveNotes]
    )

    return null
}
