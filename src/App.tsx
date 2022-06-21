import './App.scss'
import React, { useMemo, useState } from 'react'
import { getMidiInfos } from './utils'
import { Keyboard } from './components/Keyboard'
import { Settings } from './components/Settings'
import { AlphabeticalNote, AudioPlayerState, Instrument, MusicSystem } from './types'
import { AppMode } from './components/ModeSelector'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayer } from './components/AudioPlayer'
import { InstrumentPlayer } from './components/InstrumentPlayer'
import { MidiFileInfos } from './components/MidiFileInfos'

export interface ActiveNote {
    name: AlphabeticalNote
    velocity: number
    id?: number
    duration?: number
    key: number
    channel: number
}

//TODO: check accessibility

function App() {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('alphabetical')
    const [isMute, setIsMute] = useState<boolean>(false)
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [midiTrackCurrentTime, setMidiTrackCurrentTime] = useState<number>(0)
    const [midiTitle, setMidiTitle] = useState<string>('')
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const [instrument, setInstrument] = useState<Instrument>('Acoustic Grand Keyboard')
    const [channelInstruments, setChannelInstruments] = useState<Map<number, string> | null>(null)
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('stopped')

    const midiInfos = useMemo(() => getMidiInfos(midiFile), [midiFile])
    const midiTrackDuration = midiInfos?.trackDuration ?? 0
    const playableTracksIndexes = midiInfos?.playableTracksIndexes ?? []
    const initialChannelInstruments = midiInfos?.initialChannelInstruments ?? new Map()
    const isMidiImported = midiFile !== null

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        setMidiTitle(title)
        setMidiFile(midiJSON)
        console.log(midiJSON)
        setMidiTrackCurrentTime(0)
        setChannelInstruments(initialChannelInstruments)
    }

    return (
        <div className="container">
            <div className="item topbar">
                {isMidiImported ? (
                    <AudioPlayer
                        isMute={isMute}
                        onToggleSound={setIsMute}
                        midiTrackCurrentTime={midiTrackCurrentTime}
                        midiTrackDuration={midiTrackDuration}
                        onChangeAudioPlayerState={setAudioPlayerState}
                        onChangeMidiTrackCurrentTime={setMidiTrackCurrentTime}
                    />
                ) : null}
                <Settings
                    appMode={appMode}
                    musicSystem={musicSystem}
                    playableTracksIndexes={playableTracksIndexes}
                    onChangeAppMode={setAppMode}
                    onChangeMusicSystem={setMusicSystem}
                    onChangeInstrument={setInstrument}
                    onChangeActiveNotes={setActiveNotes}
                />
            </div>
            <div className="item">
                {midiInfos ? <MidiFileInfos midiInfos={midiInfos} midiTitle={midiTitle} /> : null}
                <Preview
                    appMode={appMode}
                    notes={activeNotes}
                    midiTrackCurrentTime={midiTrackCurrentTime}
                    midiFile={midiFile}
                    midiInfos={midiInfos}
                    activeNotes={activeNotes}
                    audioPlayerState={audioPlayerState}
                    onChangeActiveNotes={setActiveNotes}
                    onMidiImport={handleMidiImport}
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
