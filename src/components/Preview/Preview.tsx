import { MidiTitle } from '../MidiTitle'
import { MidiImporter } from '../MidiImporter'
import { Visualizer } from '../Visualizer'
import { Keyboard } from '../Keyboard'
import { InstrumentPlayer } from '../InstrumentPlayer'
import React, { useCallback, useEffect, useState } from 'react'
import { MidiMessageManager } from '../MidiMessageManager'
import {
    Instrument,
    ActiveNote,
    AudioPlayerState,
    InstrumentUserFriendlyName,
    MidiAccessMode,
    MidiMetas,
    MidiMode,
    MusicSystem,
    LoopTimestamps,
} from '../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { getInitialInstruments, getMidiMetas } from '../../utils'
import { DEFAULT_INSTRUMENTS } from '../../utils/const'

const AUDIO_CONTEXT = new AudioContext()

interface PreviewProps {
    isMute: boolean
    showNotes: boolean
    timeToNextNote: number | null
    midiTitle: string
    loopTimes: LoopTimestamps
    activeTracks: number[]
    audioPlayerState: AudioPlayerState
    midiInput: MIDIInput | null
    midiOutput: MIDIOutput | null
    musicSystem: MusicSystem
    midiAccessMode: MidiAccessMode
    midiMetas: MidiMetas | null
    midiMode: MidiMode
    worker: Worker
    activeInstruments: Instrument[]
    isEditingLoop: boolean
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onMidiTitleChange: React.Dispatch<React.SetStateAction<string>>
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeMidiMetas: React.Dispatch<React.SetStateAction<MidiMetas | null>>
    onChangeTimeToNextNote: React.Dispatch<React.SetStateAction<number | null>>
    onChangeLoadedInstrumentPlayers: React.Dispatch<
        React.SetStateAction<InstrumentUserFriendlyName[]>
    >
}

export function Preview({
    isMute,
    showNotes,
    timeToNextNote,
    activeTracks,
    loopTimes,
    midiInput,
    midiOutput,
    midiMetas,
    midiMode,
    musicSystem,
    midiAccessMode,
    worker,
    midiTitle,
    activeInstruments,
    audioPlayerState,
    isEditingLoop,
    onChangeActiveInstruments,
    onMidiTitleChange,
    onChangeLoopTimestamps,
    onChangeActiveTracks,
    onChangeAudioPlayerState,
    onChangeMidiMetas,
    onChangeTimeToNextNote,
    onChangeLoadedInstrumentPlayers,
}: PreviewProps) {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const handleAllMidiKeysPlayed = useCallback(
        function handleAllMidiKeysPlayed() {
            if (timeToNextNote && midiMode === 'wait') {
                onChangeAudioPlayerState('playing')
            }
        },
        [midiMode, timeToNextNote]
    )

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        const metas = getMidiMetas(midiJSON)
        const playableTracks = metas.tracksMetas.filter((track) => track.isPlayable)
        const { instruments } = metas
        const initialInstruments = getInitialInstruments(instruments)

        onMidiTitleChange(title)
        setMidiFile(midiJSON)
        onChangeMidiMetas(metas)
        onChangeActiveInstruments([...DEFAULT_INSTRUMENTS, ...initialInstruments])
        onChangeActiveTracks(playableTracks.map(({ index }) => index))
        onChangeAudioPlayerState('stopped')
        onChangeLoopTimestamps([null, null])
        // console.log(midiJSON)
        // console.log(metas)
    }

    useEffect(() => {
        if (isMute) {
            /*
                Suspends the progression of time in the audio context,
                temporarily halting audio hardware access and reducing CPU/battery usage in the process.
            */
            const suspend = async () => {
                await AUDIO_CONTEXT.suspend()
            }
            suspend().catch((e) => console.error(e))
        } else {
            const resume = async () => {
                await AUDIO_CONTEXT.resume()
            }
            resume().catch((e) => console.error(e))
        }
    }, [isMute])
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
                <Visualizer
                    intervalWorker={worker}
                    loopTimestamps={loopTimes}
                    activeInstruments={activeInstruments}
                    midiMode={midiMode}
                    isEditingLoop={isEditingLoop}
                    midiFile={midiFile}
                    midiMetas={midiMetas}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={setActiveNotes}
                    onChangeTimeToNextNote={onChangeTimeToNextNote}
                    onChangeActiveInstruments={onChangeActiveInstruments}
                    onChangeLoopTimestamps={onChangeLoopTimestamps}
                />
            </div>
            <div className="item">
                <Keyboard
                    activeNotes={activeNotes}
                    musicSystem={musicSystem}
                    midiMode={midiMode}
                    showNotes={showNotes}
                    onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                    onKeyPressed={setActiveNotes}
                />
                {activeInstruments.map(({ channel, name, notes }) => {
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
                            onChangeLoadedInstrumentPlayers={onChangeLoadedInstrumentPlayers}
                        />
                    )
                })}
            </div>
        </>
    )
}
