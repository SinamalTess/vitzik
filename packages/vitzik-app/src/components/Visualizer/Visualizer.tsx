import { MidiVisualizer } from '../MidiVisualizer'
import React, { useEffect, useMemo } from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import {
    MidiMetas,
    ActiveNote,
    MidiPlayMode,
    LoopTimestamps,
    AudioPlayerState,
    ActiveInstrument,
} from '../../types'
import { ErrorBoundary } from 'vitzik-ui'
import { MidiEventsManager } from '../MidiVisualizer/MidiEventsManager'
import { VisualizerFactory } from '../MidiVisualizer/utils'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'

interface VisualizerProps {
    activeInstruments: ActiveInstrument[]
    midiPlayMode: MidiPlayMode
    nextNoteStartingTime: number | null
    loopTimestamps: LoopTimestamps
    isEditingLoop: boolean
    showDampPedal: boolean
    midiSpeedFactor: number
    midiFile: IMidiFile
    midiMetas: MidiMetas
    activeTracks: number[]
    height?: number
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

const MS_PER_SECTION = 2000

export const Visualizer = WithContainerDimensions(function Visualizer({
    loopTimestamps,
    activeInstruments,
    midiPlayMode,
    midiSpeedFactor,
    nextNoteStartingTime,
    isEditingLoop,
    showDampPedal,
    midiFile,
    midiMetas,
    height = 0,
    width = 0,
    activeTracks,
    onChangeActiveNotes,
    onChangeNextNoteStartingTime,
    onChangeActiveInstruments,
    onChangeLoopTimestamps,
    onChangeAudioPlayerState,
}: VisualizerProps) {
    const config = { midiSpeedFactor, showDampPedal, isEditingLoop, MS_PER_SECTION, height, width }

    const visualizerFactory = useMemo(
        () => new VisualizerFactory({ height, width }, MS_PER_SECTION, midiMetas, midiFile),
        [height, midiMetas, width]
    )

    useEffect(() => {
        visualizerFactory.setEventsForTracks(activeTracks)
    }, [activeTracks, visualizerFactory])

    const data = useMemo(() => {
        visualizerFactory.clearThirdEvents()
        if (loopTimestamps) {
            const [startLoop, endLoop] = loopTimestamps
            if (startLoop) {
                visualizerFactory.addLoopTimeStampEvent(startLoop)
            }
            if (endLoop) {
                visualizerFactory.addLoopTimeStampEvent(endLoop)
            }
        }
        visualizerFactory.setEventsForTracks(activeTracks)
        if (!showDampPedal) {
            return visualizerFactory.getNoteEvents()
        } else {
            return visualizerFactory.getAllEvents()
        }
    }, [visualizerFactory, showDampPedal, activeTracks, loopTimestamps])

    return (
        <ErrorBoundary>
            {midiMetas && midiFile ? (
                <>
                    <MidiVisualizer
                        data={data}
                        config={config}
                        loopTimestamps={loopTimestamps}
                        midiMetas={midiMetas}
                        visualizerFactory={visualizerFactory}
                        onChangeLoopTimes={onChangeLoopTimestamps}
                    />
                    <MidiEventsManager
                        showDampPedal={showDampPedal}
                        nextNoteStartingTime={nextNoteStartingTime}
                        midiPlayMode={midiPlayMode}
                        midiMetas={midiMetas}
                        loopTimestamps={loopTimestamps}
                        visualizerFactory={visualizerFactory}
                        activeInstruments={activeInstruments}
                        data={data}
                        onChangeActiveNotes={onChangeActiveNotes}
                        onChangeActiveInstruments={onChangeActiveInstruments}
                        onChangeNextNoteStartingTime={onChangeNextNoteStartingTime}
                        onChangeAudioPlayerState={onChangeAudioPlayerState}
                    />
                </>
            ) : null}
        </ErrorBoundary>
    )
})
