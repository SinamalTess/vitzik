import { MidiTitle } from '../MidiTitle'
import { MidiImporter } from '../MidiImporter'
import { Visualizer } from '../Visualizer'
import { Keyboard } from '../Keyboard'
import { InstrumentPlayer } from '../InstrumentPlayer'
import React, { useCallback, useEffect, useState } from 'react'
import { MidiMessageManager } from '../MidiMessageManager'
import {
    ActiveNote,
    AudioPlayerState,
    InstrumentUserFriendlyName,
    MidiAccessMode,
    MidiMetas,
    MidiPlayMode,
    MusicSystem,
    LoopTimestamps,
    ActiveInstrument,
} from '../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { getMidiMetas, MidiFactory } from '../../utils'
import { DEFAULT_INSTRUMENTS, instrumentsToActiveInstruments } from '../../utils/const'
import { MidiVisualizerUserConfig } from '../../types/MidiVisualizerConfig'
import { useIntervalWorker } from '../../hooks'

const AUDIO_CONTEXT = new AudioContext()

/*
    Suspends the progression of time in the audio context,
    temporarily halting audio hardware access and reducing CPU/battery usage in the process.
*/
function suspendAudioContext() {
    const suspend = async () => {
        await AUDIO_CONTEXT.suspend()
    }
    suspend().catch((e) => console.error(e))
}

function resumeAudioContext() {
    const resume = async () => {
        await AUDIO_CONTEXT.resume()
    }
    resume().catch((e) => console.error(e))
}

interface PreviewProps {
    isMute: boolean
    showNotes: boolean
    showDampPedal: boolean
    midiTitle: string
    loopTimestamps: LoopTimestamps
    activeTracks: number[]
    audioPlayerState: AudioPlayerState
    midiInput: MIDIInput | null
    midiOutput: MIDIOutput | null
    musicSystem: MusicSystem
    midiAccessMode: MidiAccessMode
    midiMetas: MidiMetas | null
    midiPlayMode: MidiPlayMode
    activeInstruments: ActiveInstrument[]
    isEditingLoop: boolean
    midiSpeedFactor: number
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeMidiTitle: React.Dispatch<React.SetStateAction<string>>
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeMidiMetas: React.Dispatch<React.SetStateAction<MidiMetas | null>>
    onChangeLoadedInstrumentPlayers: React.Dispatch<
        React.SetStateAction<InstrumentUserFriendlyName[]>
    >
}

export function Preview({
    isMute,
    showNotes,
    showDampPedal,
    activeTracks,
    loopTimestamps,
    midiInput,
    midiOutput,
    midiMetas,
    midiPlayMode,
    musicSystem,
    midiAccessMode,
    midiTitle,
    midiSpeedFactor,
    activeInstruments,
    audioPlayerState,
    isEditingLoop,
    onChangeActiveInstruments,
    onChangeMidiTitle,
    onChangeLoopTimestamps,
    onChangeActiveTracks,
    onChangeAudioPlayerState,
    onChangeMidiMetas,
    onChangeLoadedInstrumentPlayers,
}: PreviewProps) {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const [nextNoteStartingTime, setNextNoteStartingTime] = useState<number | null>(null)
    const { timeRef, intervalWorker } = useIntervalWorker(onTimeChange)

    const visualizerConfig: MidiVisualizerUserConfig = {
        midiSpeedFactor,
        msPerSection: 2000,
        showDampPedal,
        activeTracks,
        showLoopEditor: isEditingLoop,
        loopTimestamps,
    }

    useEffect(() => {
        if (isMute) {
            suspendAudioContext()
        } else {
            resumeAudioContext()
        }
    }, [isMute])

    const handleAllMidiKeysPlayed = useCallback(
        function handleAllMidiKeysPlayed() {
            const shouldPlayForward = nextNoteStartingTime && midiPlayMode === 'waitForValidInput'
            if (shouldPlayForward) {
                onChangeAudioPlayerState('playing')
            }
        },
        [midiPlayMode, nextNoteStartingTime]
    )

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        const metas = getMidiMetas(midiJSON)
        const playableTracks = metas.tracksMetas.filter((track) => track.isPlayable)
        const { instruments } = metas
        const initialInstruments = MidiFactory.getInitialInstruments(instruments)
        const initialActiveInstruments = instrumentsToActiveInstruments(initialInstruments)

        onChangeMidiTitle(title)
        setMidiFile(midiJSON)
        onChangeMidiMetas(metas)
        onChangeActiveInstruments([...DEFAULT_INSTRUMENTS, ...initialActiveInstruments])
        onChangeActiveTracks(playableTracks.map(({ index }) => index))
        onChangeAudioPlayerState('stopped')
        onChangeLoopTimestamps([null, null])
        // console.log(midiJSON)
        // console.log(metas)
    }

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        timeRef.current = time
        if (midiPlayMode === 'waitForValidInput') {
            pauseIfNextNoteIsReached(time)
        }
        if (loopTimestamps) {
            pauseIfEndOfLoop(time)
        }
    }

    function pauseIfNextNoteIsReached(time: number) {
        if (!nextNoteStartingTime) return

        if (time >= nextNoteStartingTime) {
            onChangeAudioPlayerState('paused')
            intervalWorker?.updateTimer(nextNoteStartingTime)
        }
    }

    function pauseIfEndOfLoop(time: number) {
        const [startLoop, endLoop] = loopTimestamps as LoopTimestamps

        if (startLoop && endLoop && time > endLoop) {
            const startAt = startLoop - 200 ?? 0
            intervalWorker?.updateTimer(startAt)
            onChangeAudioPlayerState('paused')
        }
    }

    function moveToNextNote() {
        if (nextNoteStartingTime) {
            intervalWorker?.updateTimer(nextNoteStartingTime)
        }
    }

    useEffect(() => {
        const [startLoop, endLoop] = loopTimestamps
        switch (midiPlayMode) {
            case 'autoplay':
                setNextNoteStartingTime(null)
                break
            case 'waitForValidInput':
                if (startLoop) {
                    intervalWorker?.updateTimer(startLoop - 100)
                }
                setNextNoteStartingTime(timeRef.current)
                moveToNextNote()
                break
        }
    }, [midiPlayMode])

    return (
        <>
            <div className="item preview">
                {midiInput ? (
                    <MidiMessageManager
                        midiAccessMode={midiAccessMode}
                        audioPlayerState={audioPlayerState}
                        midiInput={midiInput}
                        midiOutput={midiOutput}
                        activeNotes={activeNotes}
                        onChangeActiveNotes={setActiveNotes}
                        onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                    />
                ) : null}
                {midiMetas ? <MidiTitle midiTitle={midiTitle} /> : null}
                <MidiImporter isMidiImported={Boolean(midiMetas)} onMidiImport={handleMidiImport} />
                {midiMetas && midiFile ? (
                    <Visualizer
                        activeInstruments={activeInstruments}
                        midiFile={midiFile}
                        config={visualizerConfig}
                        midiMetas={midiMetas}
                        onChangeActiveNotes={setActiveNotes}
                        onChangeNextNoteStartingTime={setNextNoteStartingTime}
                        onChangeActiveInstruments={onChangeActiveInstruments}
                        onChangeLoopTimestamps={onChangeLoopTimestamps}
                    />
                ) : null}
            </div>
            <div className="item">
                <Keyboard
                    activeNotes={activeNotes}
                    musicSystem={musicSystem}
                    midiPlayMode={midiPlayMode}
                    showNotes={showNotes}
                    onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                    onChangeActiveNotes={setActiveNotes}
                />
                {activeInstruments.map(({ channel, name, notes, isDampPedalOn }) => {
                    return (
                        <InstrumentPlayer
                            audioPlayerState={audioPlayerState}
                            midiInput={midiInput}
                            audioContext={AUDIO_CONTEXT}
                            key={`${name}-${channel}`}
                            isMute={isMute}
                            activeNotes={activeNotes}
                            instrumentName={name}
                            notesToLoad={[...notes]}
                            channel={channel}
                            isDampPedalOn={isDampPedalOn}
                            onChangeLoadedInstrumentPlayers={onChangeLoadedInstrumentPlayers}
                        />
                    )
                })}
            </div>
        </>
    )
}
