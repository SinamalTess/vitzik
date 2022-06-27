import './App.scss'
import React, { useEffect, useMemo, useState } from 'react'
import { getMidiInfos } from './utils'
import { Keyboard } from './components/Keyboard'
import { Settings } from './components/Settings'
import { AudioPlayerState, Instrument, MidiMode, MusicSystem, AppMode, ActiveNote } from './types'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayer } from './components/AudioPlayer'
import { InstrumentPlayer } from './components/InstrumentPlayer'
import { MidiFileInfos } from './components/MidiFileInfos'
import { MidiMessageManager } from './components/MidiMessageManager'

//TODO: check accessibility

const userInstrument: Instrument = {
    name: 'Acoustic Grand Keyboard',
    channel: 16,
    index: 1,
}

function App() {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [notesPlayed, setNotesPlayed] = useState<string[]>([])
    const [timeToNextNote, setTimeToNextNote] = useState<number | null>(null)
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('alphabetical')
    const [isMute, setIsMute] = useState<boolean>(false)
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [midiCurrentTime, setMidiCurrentTime] = useState<number>(0)
    const [midiTitle, setMidiTitle] = useState<string>('')
    const [midiInput, setMidiInput] = useState<MIDIInput | null>(null)
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const [instruments, setInstruments] = useState<Instrument[]>([userInstrument])
    const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('stopped')
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [midiMode, setMidiMode] = useState<MidiMode>('autoplay')
    const [activeTracks, setActiveTracks] = useState<number[]>([])

    const midiInfos = useMemo(() => getMidiInfos(midiFile), [midiFile])
    const midiDuration = midiInfos?.midiDuration ?? 0
    const playableTracksIndexes = midiInfos?.playableTracksIndexes ?? []
    const initialInstruments = midiInfos?.initialInstruments ?? []
    const isMidiImported = midiFile !== null

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        setMidiTitle(title)
        setMidiFile(midiJSON)
        console.log(midiJSON)
    }

    function handleAllMidiKeysPlayed() {
        if (timeToNextNote && midiMode === 'wait') {
            setIsPlaying(true)
        }
    }

    useEffect(() => {
        if (
            timeToNextNote &&
            isPlaying &&
            midiCurrentTime >= timeToNextNote &&
            midiMode === 'wait'
        ) {
            setIsPlaying(false)
        }
    }, [midiCurrentTime, isPlaying, midiMode])

    useEffect(() => {
        if (!midiInfos) return
        setMidiCurrentTime(0)
        setInstruments((instruments) => [...instruments, ...initialInstruments])
        setActiveTracks([...playableTracksIndexes])
        return function cleanup() {
            setInstruments([userInstrument])
        }
    }, [midiInfos])

    return (
        <div className="container">
            <div className="item topbar">
                {isMidiImported ? (
                    <AudioPlayer
                        isMute={isMute}
                        isPlaying={isPlaying}
                        onToggleSound={setIsMute}
                        midiCurrentTime={midiCurrentTime}
                        midiDuration={midiDuration}
                        onChangeAudioPlayerState={setAudioPlayerState}
                        onChangeMidiCurrentTime={setMidiCurrentTime}
                        onPlay={setIsPlaying}
                    />
                ) : null}
                <Settings
                    appMode={appMode}
                    midiMode={midiMode}
                    musicSystem={musicSystem}
                    playableTracksIndexes={playableTracksIndexes}
                    activeTracks={activeTracks}
                    onMidiInputChange={setMidiInput}
                    onChangeAppMode={setAppMode}
                    onChangeMusicSystem={setMusicSystem}
                    onChangeInstrument={setInstruments}
                    onChangeActiveNotes={setActiveNotes}
                    onChangeActiveTracks={setActiveTracks}
                    onMidiModeChange={setMidiMode}
                />
                <MidiMessageManager
                    audioPlayerState={audioPlayerState}
                    midiInput={midiInput}
                    activeNotes={activeNotes}
                    onChangeActiveNotes={setActiveNotes}
                    onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                    onNotePlayed={setNotesPlayed}
                />
            </div>
            <div className="item">
                {midiInfos ? <MidiFileInfos midiInfos={midiInfos} midiTitle={midiTitle} /> : null}
                <Preview
                    appMode={appMode}
                    midiCurrentTime={midiCurrentTime}
                    midiFile={midiFile}
                    midiInfos={midiInfos}
                    activeNotes={activeNotes}
                    audioPlayerState={audioPlayerState}
                    activeTracks={activeTracks}
                    onMidiImport={handleMidiImport}
                    onChangeActiveNotes={setActiveNotes}
                    onChangeTimeToNextNote={setTimeToNextNote}
                />
            </div>
            <div className="item">
                <Keyboard
                    activeKeys={activeNotes}
                    musicSystem={musicSystem}
                    onKeyPressed={setActiveNotes}
                    onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                    notesPlayed={notesPlayed}
                />
                <>
                    {instruments.map(({ channel, name }) => {
                        const activeKeys = activeNotes.filter((note) => note.channel === channel)
                        return (
                            <InstrumentPlayer
                                key={`${name}-${channel}`}
                                isMute={isMute}
                                audioPlayerState={audioPlayerState}
                                activeKeys={activeKeys}
                                instrument={name}
                                midiFile={midiFile}
                            />
                        )
                    })}
                </>
            </div>
        </div>
    )
}

export default App
