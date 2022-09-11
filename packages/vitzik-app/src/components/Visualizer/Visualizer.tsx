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
import { LoopEditor } from '../MidiVisualizer/LoopEditor'
import { MidiVisualizerUserConfig } from '../../types/MidiVisualizerConfig'
import { MidiVisualizer } from '../MidiVisualizer'

interface VisualizerProps {
    activeInstruments: ActiveInstrument[]
    midiPlayMode: MidiPlayMode
    config: MidiVisualizerUserConfig
    midiFile: IMidiFile
    midiMetas: MidiMetas
    height?: number
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
}

export const Visualizer = WithContainerDimensions(function Visualizer({
    activeInstruments,
    midiPlayMode,
    config: userConfig,
    midiFile,
    midiMetas,
    height = 0,
    width = 0,
    onChangeActiveNotes,
    onChangeNextNoteStartingTime,
    onChangeActiveInstruments,
    onChangeLoopTimestamps,
    onChangeAudioPlayerState,
}: VisualizerProps) {
    const config = {
        ...userConfig,
        height,
        width,
    }

    const { msPerSection, showDampPedal, activeTracks, showLoopEditor, loopTimestamps } = config

    const visualizerFactory = useMemo(
        () => new VisualizerFactory({ height, width }, msPerSection, midiMetas, midiFile),
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
                    <MidiVisualizer data={data} config={config} />
                    {showLoopEditor && loopTimestamps ? (
                        <LoopEditor
                            config={config}
                            onChangeLoopTimestamps={onChangeLoopTimestamps}
                        />
                    ) : null}
                    <MidiEventsManager
                        data={data}
                        config={config}
                        midiPlayMode={midiPlayMode}
                        midiMetas={midiMetas}
                        activeInstruments={activeInstruments}
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
