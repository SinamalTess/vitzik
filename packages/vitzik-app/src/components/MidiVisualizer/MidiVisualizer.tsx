import React, { useEffect, useMemo } from 'react'
import { IMidiFile } from 'midi-json-parser-worker'
import { MidiMetas, ActiveNote, LoopTimestamps, ActiveInstrument } from '../../types'
import { ErrorBoundary } from 'vitzik-ui'
import { EventManager } from './components/EventManager'
import { DataFactory } from './factories'
import { WithContainerDimensions } from '../_hocs/WithContainerDimensions'
import { LoopEditor } from './components/LoopEditor'
import { MidiVisualizerUserConfig } from '../../types/MidiVisualizerConfig'
import { Visualizer } from './components/Visualizer'
import throttle from 'lodash/throttle'
import { useIntervalWorker } from '../../hooks'

interface MidiVisualizerProps {
    activeInstruments: ActiveInstrument[]
    config: MidiVisualizerUserConfig
    midiFile: IMidiFile
    midiMetas: MidiMetas
    height?: number
    width?: number
    onChangeActiveNotes: React.Dispatch<React.SetStateAction<ActiveNote[]>>
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeNextNoteStartingTime: (nextNoteStartingTime: number | null) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
}

export const MidiVisualizer = WithContainerDimensions(function MidiVisualizer({
    activeInstruments,
    config: userConfig,
    midiFile,
    midiMetas,
    height = 0,
    width = 0,
    onChangeActiveNotes,
    onChangeNextNoteStartingTime,
    onChangeActiveInstruments,
    onChangeLoopTimestamps,
}: MidiVisualizerProps) {
    const config = {
        ...userConfig,
        height,
        width,
    }
    const { timeRef, intervalWorker } = useIntervalWorker()
    const { msPerSection, showDampPedal, activeTracks, showLoopEditor, loopTimestamps } = config
    const { midiDuration } = midiMetas
    const visualizerFactory = useMemo(
        () => new DataFactory({ height, width }, msPerSection, midiMetas, midiFile),
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

    // @ts-ignore
    function handleWheel(e: WheelEvent<HTMLDivElement>) {
        const onWheel = () => {
            const { deltaY } = e
            const newTime = timeRef.current - deltaY
            const isValidTime = newTime >= 0 && newTime < midiDuration

            if (isValidTime) {
                intervalWorker?.updateTimer(newTime)
            }
        }

        throttle(onWheel, 100)()
    }

    return (
        <ErrorBoundary>
            {midiMetas && midiFile ? (
                <>
                    <Visualizer data={data} config={config} onWheel={handleWheel} />
                    {showLoopEditor && loopTimestamps ? (
                        <LoopEditor
                            config={config}
                            onWheel={handleWheel}
                            onChangeLoopTimestamps={onChangeLoopTimestamps}
                        />
                    ) : null}
                    <EventManager
                        data={data}
                        config={config}
                        midiMetas={midiMetas}
                        activeInstruments={activeInstruments}
                        onChangeActiveNotes={onChangeActiveNotes}
                        onChangeActiveInstruments={onChangeActiveInstruments}
                        onChangeNextNoteStartingTime={onChangeNextNoteStartingTime}
                    />
                </>
            ) : null}
        </ErrorBoundary>
    )
})
