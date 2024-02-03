import './App.scss'
import React, { useState } from 'react'
import { Settings } from './components/Settings'
import {
    AudioPlayerState,
    MidiPlayMode,
    MusicSystem,
    AppMode,
    MidiMetas,
    InstrumentUserFriendlyName,
    MidiAccessMode,
    LoopTimestamps,
    ActiveInstrument,
} from './types'
import { AudioPlayer } from './components/AudioPlayer'
import { DEFAULT_INSTRUMENTS } from './const'
import { useTitle } from './hooks'
import { AppInfos } from './components/AppInfos'
import { Preview } from './components/Preview'
import { AppContextProvider } from './components/_contexts'

function App() {
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('alphabetical')
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [activeInstruments, setActiveInstruments] =
        useState<ActiveInstrument[]>(DEFAULT_INSTRUMENTS)
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('stopped')
    const [isMute, setIsMute] = useState(false)
    const [activeTracks, setActiveTracks] = useState<number[]>([])
    const [midiMetas, setMidiMetas] = useState<MidiMetas | null>(null)
    const [midiSpeedFactor, setMidiSpeedFactor] = useState(1)
    const [midiAccessMode, setMidiAccessMode] = useState<MidiAccessMode>('input')
    const [midiTitle, setMidiTitle] = useState<string>('')
    const [midiInput, setMidiInput] = useState<MIDIInput | null>(null)
    const [midiOutput, setMidiOutput] = useState<MIDIOutput | null>(null)
    const [midiPlayMode, setMidiPlayMode] = useState<MidiPlayMode>('autoplay')
    const [loopTimestamps, setLoopTimestamps] = useState<LoopTimestamps>([null, null])
    const [isEditingLoop, setIsEditingLoop] = useState(false)
    const [showNotes, setShowNotes] = useState(true)
    const [showDampPedal, setShowDampPedal] = useState(true)
    const [loadedInstrumentPlayers, setLoadedInstrumentPlayers] = useState<
        InstrumentUserFriendlyName[]
    >([])

    useTitle('Vitzik')

    return (
        <AppContextProvider>
            <div className="container">
                <div className="item topbar">
                    {midiMetas ? (
                        <AudioPlayer
                            midiMetas={midiMetas}
                            midiSpeedFactor={midiSpeedFactor}
                            playerState={audioPlayerState}
                            isMute={isMute}
                            title={midiTitle}
                            duration={midiMetas.midiDuration}
                            loopTimes={loopTimestamps}
                            onChangeState={setAudioPlayerState}
                            onToggleSound={setIsMute}
                        />
                    ) : (
                        <AppInfos />
                    )}
                    <Settings
                        showNotes={showNotes}
                        showDampPedal={showDampPedal}
                        isEditingLoop={isEditingLoop}
                        activeInstruments={activeInstruments}
                        appMode={appMode}
                        midiSpeedFactor={midiSpeedFactor}
                        midiMetas={midiMetas}
                        loadedInstrumentPlayers={loadedInstrumentPlayers}
                        midiPlayMode={midiPlayMode}
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
                        onMidiModeChange={setMidiPlayMode}
                        onMidiAccessModeChange={setMidiAccessMode}
                        onChangeIsEditingLoop={setIsEditingLoop}
                        onMute={setIsMute}
                        onChangeLoopTimestamps={setLoopTimestamps}
                        onChangeShowNotes={setShowNotes}
                        onChangeShowDampPedal={setShowDampPedal}
                    />
                </div>
                <Preview
                    isMute={isMute}
                    midiTitle={midiTitle}
                    midiMetas={midiMetas}
                    activeTracks={activeTracks}
                    showNotes={showNotes}
                    showDampPedal={showDampPedal}
                    midiSpeedFactor={midiSpeedFactor}
                    audioPlayerState={audioPlayerState}
                    midiInput={midiInput}
                    midiOutput={midiOutput}
                    loopTimestamps={loopTimestamps}
                    midiAccessMode={midiAccessMode}
                    activeInstruments={activeInstruments}
                    isEditingLoop={isEditingLoop}
                    midiPlayMode={midiPlayMode}
                    musicSystem={musicSystem}
                    onChangeMidiTitle={setMidiTitle}
                    onChangeLoopTimestamps={setLoopTimestamps}
                    onChangeActiveInstruments={setActiveInstruments}
                    onChangeActiveTracks={setActiveTracks}
                    onChangeAudioPlayerState={setAudioPlayerState}
                    onChangeMidiMetas={setMidiMetas}
                    onChangeLoadedInstrumentPlayers={setLoadedInstrumentPlayers}
                />
            </div>
        </AppContextProvider>
    )
}

export default App
