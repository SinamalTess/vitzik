import './App.scss'
import React, { useCallback, useEffect, useState } from 'react'
import { getInitialInstruments, getMidiMetas } from './utils'
import { Keyboard } from './components/Keyboard'
import { Settings } from './components/Settings'
import {
    AudioPlayerState,
    Instrument,
    MidiMode,
    MusicSystem,
    AppMode,
    ActiveNote,
    MidiMetas,
} from './types'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayer } from './components/AudioPlayer'
import { InstrumentPlayer } from './components/InstrumentPlayer'
import { MidiMessageManager } from './components/MidiMessageManager'
import { MidiTitle } from './components/MidiTitle'
import { MidiImporter } from './components/MidiImporter'
import { DEFAULT_INSTRUMENTS } from './utils/const'
import { MidiAccessMode } from './types/MidiAccessMode'
import { LoopTimes } from './types/LoopTimes'
import { WebWorker } from './workers/WebWorker'
// @ts-ignore
import workerInterval from './workers/interval'
import { useTitle } from './_hooks/useTitle'

const AUDIO_CONTEXT = new AudioContext()
let worker: Worker = WebWorker(workerInterval)

function App() {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [timeToNextNote, setTimeToNextNote] = useState<number | null>(null)
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('alphabetical')
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [activeInstruments, setActiveInstruments] = useState<Instrument[]>(DEFAULT_INSTRUMENTS)
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('stopped')
    const [isMute, setIsMute] = useState<boolean>(false)
    const [activeTracks, setActiveTracks] = useState<number[]>([])
    const [midiMetas, setMidiMetas] = useState<MidiMetas | null>(null)
    const [midiSpeedFactor, setMidiSpeedFactor] = useState<number>(1)
    const [midiAccessMode, setMidiAccessMode] = useState<MidiAccessMode>('input')
    const [midiTitle, setMidiTitle] = useState<string>('')
    const [midiInput, setMidiInput] = useState<MIDIInput | null>(null)
    const [midiOutput, setMidiOutput] = useState<MIDIOutput | null>(null)
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const [midiMode, setMidiMode] = useState<MidiMode>('autoplay')
    const [loopTimes, setLoopTimes] = useState<LoopTimes>([null, null])
    const [isEditingLoop, setIsEditingLoop] = useState(false)

    useTitle('Vitzik')

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

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        const metas = getMidiMetas(midiJSON)
        const playableTracks = metas.tracksMetas.filter((track) => track.isPlayable)
        const { instruments } = metas
        const initialInstruments = getInitialInstruments(instruments)

        setMidiTitle(title)
        setMidiFile(midiJSON)
        setMidiMetas(metas)
        setActiveInstruments([...DEFAULT_INSTRUMENTS, ...initialInstruments])
        setActiveTracks(playableTracks.map(({ index }) => index))

        // console.log(midiJSON)
        // console.log(metas)
    }

    const handleAllMidiKeysPlayed = useCallback(
        function handleAllMidiKeysPlayed() {
            if (timeToNextNote && midiMode === 'wait') {
                setAudioPlayerState('playing')
            }
        },
        [midiMode, timeToNextNote]
    )

    return (
        <div className="container">
            <div className="item topbar">
                {midiMetas ? (
                    <AudioPlayer
                        midiSpeedFactor={midiSpeedFactor}
                        worker={worker}
                        state={audioPlayerState}
                        isMute={isMute}
                        timeToNextNote={timeToNextNote}
                        title={midiTitle}
                        duration={midiMetas.midiDuration}
                        loopTimes={loopTimes}
                        onChangeState={setAudioPlayerState}
                        onMute={setIsMute}
                    />
                ) : (
                    <div />
                )}
                <Settings
                    worker={worker}
                    isEditingLoop={isEditingLoop}
                    activeInstruments={activeInstruments}
                    appMode={appMode}
                    midiSpeedFactor={midiSpeedFactor}
                    midiMetas={midiMetas}
                    midiMode={midiMode}
                    midiAccessMode={midiAccessMode}
                    musicSystem={musicSystem}
                    activeTracks={activeTracks}
                    onMidiInputChange={setMidiInput}
                    onMidiOutputChange={setMidiOutput}
                    onChangeAppMode={setAppMode}
                    onChangeMidiSpeedFactor={setMidiSpeedFactor}
                    onChangeMusicSystem={setMusicSystem}
                    onChangeInstrument={setActiveInstruments}
                    onChangeActiveTracks={setActiveTracks}
                    onMidiModeChange={setMidiMode}
                    onMidiAccessModeChange={setMidiAccessMode}
                    onChangeIsEditingLoop={setIsEditingLoop}
                    onMute={setIsMute}
                    onChangeLoopTimes={setLoopTimes}
                />
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
            </div>
            <div className="item preview">
                {midiMetas ? <MidiTitle midiTitle={midiTitle} /> : null}
                <MidiImporter isMidiImported={Boolean(midiMetas)} onMidiImport={handleMidiImport} />
                <Preview
                    worker={worker}
                    loopTimes={loopTimes}
                    activeInstruments={activeInstruments}
                    midiMode={midiMode}
                    isEditingLoop={isEditingLoop}
                    midiFile={midiFile}
                    midiMetas={midiMetas}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={setActiveNotes}
                    onChangeTimeToNextNote={setTimeToNextNote}
                    onChangeActiveInstruments={setActiveInstruments}
                    onChangeLoopTimes={setLoopTimes}
                />
            </div>
            <div className="item">
                <Keyboard
                    activeNotes={activeNotes}
                    musicSystem={musicSystem}
                    midiMode={midiMode}
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
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default App
