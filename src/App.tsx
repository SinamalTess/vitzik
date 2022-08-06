import './App.scss'
import React, { useEffect, useState } from 'react'
import { Settings } from './components/Settings'
import {
    AudioPlayerState,
    MidiMode,
    MusicSystem,
    AppMode,
    MidiMetas,
    Instrument,
    InstrumentUserFriendlyName,
    MidiAccessMode,
    LoopTimes,
} from './types'
import { AudioPlayer } from './components/AudioPlayer'
import { DEFAULT_INSTRUMENTS } from './utils/const'
import { WebWorker } from './workers/WebWorker'
// @ts-ignore
import intervalWorker from './workers/intervalWorker.js'
import { useTitle } from './_hooks'
import { Infos } from './components/Infos'
import { ShortcutsContextProvider } from './components/ShortcutsContext/ShortcutsContext'
import { Preview } from './components/Preview'

let worker: Worker = WebWorker(intervalWorker)

function App() {
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
    const [midiMode, setMidiMode] = useState<MidiMode>('autoplay')
    const [loopTimes, setLoopTimes] = useState<LoopTimes>([null, null])
    const [isEditingLoop, setIsEditingLoop] = useState(false)
    const [showNotes, setShowNotes] = useState(true)
    const [loadedInstrumentPlayers, setLoadedInstrumentPlayers] = useState<
        InstrumentUserFriendlyName[]
    >([])

    useTitle('Vitzik')

    useEffect(() => {
        if (midiMode === 'autoplay') {
            // clears the next note in case one was set so the player can play without stopping
            setTimeToNextNote(null)
        }
    }, [midiMode])

    return (
        <ShortcutsContextProvider>
            <div className="container">
                <div className="item topbar">
                    {midiMetas ? (
                        <AudioPlayer
                            midiMetas={midiMetas}
                            midiSpeedFactor={midiSpeedFactor}
                            worker={worker}
                            state={audioPlayerState}
                            isMute={isMute}
                            timeToNextNote={timeToNextNote}
                            title={midiTitle}
                            duration={midiMetas.midiDuration}
                            loopTimes={loopTimes}
                            onChangeState={setAudioPlayerState}
                            onToggleSound={setIsMute}
                        />
                    ) : (
                        <Infos />
                    )}
                    <Settings
                        worker={worker}
                        showNotes={showNotes}
                        isEditingLoop={isEditingLoop}
                        activeInstruments={activeInstruments}
                        appMode={appMode}
                        midiSpeedFactor={midiSpeedFactor}
                        midiMetas={midiMetas}
                        loadedInstrumentPlayers={loadedInstrumentPlayers}
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
                        onChangeShowNotes={setShowNotes}
                    />
                </div>
                <Preview
                    timeToNextNote={timeToNextNote}
                    isMute={isMute}
                    midiTitle={midiTitle}
                    midiMetas={midiMetas}
                    activeTracks={activeTracks}
                    showNotes={showNotes}
                    audioPlayerState={audioPlayerState}
                    midiInput={midiInput}
                    midiOutput={midiOutput}
                    loopTimes={loopTimes}
                    midiAccessMode={midiAccessMode}
                    worker={worker}
                    activeInstruments={activeInstruments}
                    isEditingLoop={isEditingLoop}
                    midiMode={midiMode}
                    musicSystem={musicSystem}
                    onMidiTitleChange={setMidiTitle}
                    onChangeLoopTimes={setLoopTimes}
                    onChangeActiveInstruments={setActiveInstruments}
                    onChangeActiveTracks={setActiveTracks}
                    onChangeAudioPlayerState={setAudioPlayerState}
                    onChangeMidiMetas={setMidiMetas}
                    onChangeTimeToNextNote={setTimeToNextNote}
                    onChangeLoadedInstrumentPlayers={setLoadedInstrumentPlayers}
                />
            </div>
        </ShortcutsContextProvider>
    )
}

export default App
