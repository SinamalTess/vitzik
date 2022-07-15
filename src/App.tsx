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
import { TimeContextProvider } from './components/TimeContextProvider/TimeContextProvider'
import { MidiImporter } from './components/MidiImporter'
import { DEFAULT_INSTRUMENTS } from './utils/const'

//TODO: check accessibility

const AUDIO_CONTEXT = new AudioContext()

function App() {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [timeToNextNote, setTimeToNextNote] = useState<number | null>(null)
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('alphabetical')
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [activeInstruments, setActiveInstruments] = useState<Instrument[]>(DEFAULT_INSTRUMENTS)
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('stopped')
    const [isMute, setIsMute] = useState<boolean>(false)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [activeTracks, setActiveTracks] = useState<number[]>([])
    const [midiMetas, setMidiMetas] = useState<MidiMetas | null>(null)
    const [midiSpeedFactor, setMidiSpeedFactor] = useState<number>(1)
    const [midiTitle, setMidiTitle] = useState<string>('')
    const [midiInput, setMidiInput] = useState<MIDIInput | null>(null)
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const [midiMode, setMidiMode] = useState<MidiMode>('autoplay')
    const [midiStartingTime, setMidiStartingTime] = useState<number>(0)
    const isMidiImported = midiFile !== null

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

        console.log(midiJSON)
        console.log(metas)
    }

    const handleAllMidiKeysPlayed = useCallback(
        function handleAllMidiKeysPlayed() {
            if (timeToNextNote && midiMode === 'wait') {
                setIsPlaying(true)
            }
        },
        [midiMode, timeToNextNote]
    )

    return (
        <TimeContextProvider
            startingTime={midiStartingTime}
            audioPlayerState={audioPlayerState}
            midiSpeedFactor={midiSpeedFactor}
        >
            <div className="container">
                <div className="item topbar">
                    {midiMetas ? (
                        <AudioPlayer
                            isMute={isMute}
                            isPlaying={isPlaying}
                            midiMode={midiMode}
                            timeToNextNote={timeToNextNote}
                            midiTitle={midiTitle}
                            midiMetas={midiMetas}
                            midiSpeedFactor={midiSpeedFactor}
                            onChangeAudioPlayerState={setAudioPlayerState}
                            onChangeMidiStartingTime={setMidiStartingTime}
                            onPlay={setIsPlaying}
                            onMute={setIsMute}
                            onChangeMidiSpeedFactor={setMidiSpeedFactor}
                        />
                    ) : null}
                    <Settings
                        activeInstruments={activeInstruments}
                        appMode={appMode}
                        midiMetas={midiMetas}
                        midiMode={midiMode}
                        isMidiImported={isMidiImported}
                        musicSystem={musicSystem}
                        activeTracks={activeTracks}
                        onMidiInputChange={setMidiInput}
                        onChangeAppMode={setAppMode}
                        onChangeMusicSystem={setMusicSystem}
                        onChangeInstrument={setActiveInstruments}
                        onChangeActiveTracks={setActiveTracks}
                        onMidiModeChange={setMidiMode}
                        onMute={setIsMute}
                    />
                    {midiInput ? (
                        <MidiMessageManager
                            audioPlayerState={audioPlayerState}
                            midiInput={midiInput}
                            activeNotes={activeNotes}
                            onChangeActiveNotes={setActiveNotes}
                            onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                        />
                    ) : null}
                </div>
                <div className="item preview">
                    {midiMetas ? <MidiTitle midiTitle={midiTitle} /> : null}
                    <MidiImporter isMidiImported={isMidiImported} onMidiImport={handleMidiImport} />
                    <Preview
                        activeInstruments={activeInstruments}
                        midiMode={midiMode}
                        midiFile={midiFile}
                        midiMetas={midiMetas}
                        audioPlayerState={audioPlayerState}
                        activeTracks={activeTracks}
                        onChangeActiveNotes={setActiveNotes}
                        onChangeTimeToNextNote={setTimeToNextNote}
                        onChangeActiveInstruments={setActiveInstruments}
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
                    <>
                        {activeInstruments.map(({ channel, name, notes }) => {
                            return (
                                <InstrumentPlayer
                                    midiInput={midiInput}
                                    audioContext={AUDIO_CONTEXT}
                                    key={`${name}-${channel}`}
                                    isMute={isMute}
                                    activeNotes={activeNotes}
                                    instrumentName={name}
                                    notesToLoad={Array.from(notes)}
                                    channel={channel}
                                />
                            )
                        })}
                    </>
                </div>
            </div>
        </TimeContextProvider>
    )
}

export default App
