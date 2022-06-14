import './App.scss'
import React, { useMemo, useState } from 'react'
import { getMidiInfos } from './utils'
import { Keyboard } from './components/Keyboard'
import { Settings } from './components/Settings'
import { AlphabeticalNote, Instrument, MusicSystem } from './types'
import { AppMode } from './components/ModeSelector'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayer, AudioPlayerState } from './components/AudioPlayer'

export interface ActiveNote {
    name: AlphabeticalNote
    velocity: number
    id?: number
    duration?: number
    key: number
}

//TODO: add error boundary
//TODO: check accessibility
//TODO: create error on unused imports

function App() {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('alphabetical')
    const [isMute, setIsMute] = useState<boolean>(false)
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [midiTrackCurrentTime, setMidiTrackCurrentTime] = useState<number>(0)
    const [midiTrackTitle, setMidiTrackTitle] = useState<string>('')
    const [midiTrack, setMidiTrack] = useState<IMidiFile | null>(null)
    const [instrument, setInstrument] = useState<Instrument>('Acoustic Grand Keyboard')
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('pending')

    const midiInfos = useMemo(() => getMidiInfos(midiTrack), [midiTrack])
    const midiTrackNotes = midiInfos?.notes ?? []
    const midiTrackDuration = midiInfos?.trackDuration ?? 0
    const midiTrackInfos = midiInfos
    const isMidiImported = midiTrack !== null

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        setMidiTrackTitle(title)
        setMidiTrack(midiJSON)
        console.log(midiJSON)
        setMidiTrackCurrentTime(0)
    }

    return (
        <div className="container">
            <div className="item topbar">
                {isMidiImported ? (
                    <AudioPlayer
                        isMute={isMute}
                        toggleSound={setIsMute}
                        midiTrackCurrentTime={midiTrackCurrentTime}
                        midiTrackDuration={midiTrackDuration}
                        onChangeAudioPlayerState={setAudioPlayerState}
                        onChangeMidiTrackCurrentTime={setMidiTrackCurrentTime}
                    />
                ) : (
                    <div> </div>
                )}
                <Settings
                    appMode={appMode}
                    musicSystem={musicSystem}
                    onChangeAppMode={setAppMode}
                    onChangeMusicSystem={setMusicSystem}
                    onChangeInstrument={setInstrument}
                    onChangeActiveNotes={setActiveNotes}
                />
            </div>
            <div className="item">
                <Preview
                    appMode={appMode}
                    notes={activeNotes}
                    midiTrackCurrentTime={midiTrackCurrentTime}
                    midiTrackNotes={midiTrackNotes}
                    midiTrackTitle={midiTrackTitle}
                    midiTrackInfos={midiTrackInfos}
                    activeNotes={activeNotes}
                    audioPlayerState={audioPlayerState}
                    onChangeActiveNotes={setActiveNotes}
                    onMidiImport={handleMidiImport}
                />
            </div>
            <div className="item">
                <Keyboard
                    instrument={instrument}
                    activeKeys={activeNotes}
                    isMute={isMute}
                    musicSystem={musicSystem}
                    onKeyPressed={setActiveNotes}
                    audioPlayerState={audioPlayerState}
                />
            </div>
        </div>
    )
}

export default App
