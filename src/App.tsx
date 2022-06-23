import './App.scss'
import React, { useEffect, useMemo, useState } from 'react'
import { getMidiInfos } from './utils'
import { Keyboard } from './components/Keyboard'
import { Settings } from './components/Settings'
import { ActiveNote, AudioPlayerState, Instrument, MusicSystem } from './types'
import { AppMode } from './components/ModeSelector'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayer } from './components/AudioPlayer'
import { InstrumentPlayer } from './components/InstrumentPlayer'
import { MidiFileInfos } from './components/MidiFileInfos'

//TODO: check accessibility

function App() {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('alphabetical')
    const [isMute, setIsMute] = useState<boolean>(false)
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [midiCurrentTime, setMidiCurrentTime] = useState<number>(0)
    const [midiTitle, setMidiTitle] = useState<string>('')
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const [instrument, setInstrument] = useState<Instrument>('Acoustic Grand Keyboard')
    const [channelInstruments, setChannelInstruments] = useState<Map<number, string> | null>(null)
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('stopped')
    const [activeTracks, setActiveTracks] = useState<number[]>([])

    const midiInfos = useMemo(() => getMidiInfos(midiFile), [midiFile])
    const midiDuration = midiInfos?.midiDuration ?? 0
    const playableTracksIndexes = midiInfos?.playableTracksIndexes ?? []
    const initialChannelInstruments = midiInfos?.initialChannelInstruments ?? new Map()
    const isMidiImported = midiFile !== null

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        setMidiTitle(title)
        setMidiFile(midiJSON)
        console.log(midiJSON)
    }

    useEffect(() => {
        if (!midiInfos) return
        setMidiCurrentTime(0)
        setChannelInstruments(initialChannelInstruments)
        setActiveTracks([playableTracksIndexes[0]]) // should support array for later
    }, [midiInfos])

    return (
        <div className="container">
            <div className="item topbar">
                {isMidiImported ? (
                    <AudioPlayer
                        isMute={isMute}
                        onToggleSound={setIsMute}
                        midiCurrentTime={midiCurrentTime}
                        midiDuration={midiDuration}
                        onChangeAudioPlayerState={setAudioPlayerState}
                        onChangeMidiCurrentTime={setMidiCurrentTime}
                    />
                ) : null}
                <Settings
                    appMode={appMode}
                    musicSystem={musicSystem}
                    playableTracksIndexes={playableTracksIndexes}
                    activeTracks={activeTracks}
                    onChangeAppMode={setAppMode}
                    onChangeMusicSystem={setMusicSystem}
                    onChangeInstrument={setInstrument}
                    onChangeActiveNotes={setActiveNotes}
                    onChangeActiveTracks={setActiveTracks}
                />
            </div>
            <div className="item">
                {midiInfos ? <MidiFileInfos midiInfos={midiInfos} midiTitle={midiTitle} /> : null}
                <Preview
                    appMode={appMode}
                    notes={activeNotes}
                    midiCurrentTime={midiCurrentTime}
                    midiFile={midiFile}
                    midiInfos={midiInfos}
                    activeNotes={activeNotes}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onMidiImport={handleMidiImport}
                    onChangeActiveNotes={setActiveNotes}
                />
            </div>
            <div className="item">
                <Keyboard
                    activeKeys={activeNotes}
                    musicSystem={musicSystem}
                    onKeyPressed={setActiveNotes}
                />
                <InstrumentPlayer
                    isMute={isMute}
                    audioPlayerState={audioPlayerState}
                    activeKeys={activeNotes}
                    instrument={instrument}
                    midiFile={midiFile}
                />
            </div>
        </div>
    )
}

export default App
