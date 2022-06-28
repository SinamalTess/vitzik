import './App.scss'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getMidiMetas } from './utils'
import { Keyboard } from './components/Keyboard'
import { Settings } from './components/Settings'
import { AudioPlayerState, Instrument, MidiMode, MusicSystem, AppMode, ActiveNote } from './types'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'
import { AudioPlayer } from './components/AudioPlayer'
import { InstrumentPlayer } from './components/InstrumentPlayer'
import { MidiFileMetas } from './components/MidiFileInfos'
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

    const midiMetas = useMemo(() => getMidiMetas(midiFile), [midiFile])
    const midiDuration = midiMetas?.midiDuration ?? 0
    const playableTracksIndexes = midiMetas?.playableTracksIndexes ?? []
    const initialInstruments = midiMetas?.initialInstruments ?? []
    const isMidiImported = midiFile !== null

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        setMidiTitle(title)
        setMidiFile(midiJSON)
        console.log(midiJSON)
    }

    const handleAllMidiKeysPlayed = useCallback(
        function handleAllMidiKeysPlayed() {
            if (timeToNextNote && midiMode === 'wait') {
                setIsPlaying(true)
            }
        },
        [midiMode, timeToNextNote]
    )

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
        if (!midiMetas) return
        setMidiCurrentTime(0)
        setInstruments((instruments) => [...instruments, ...initialInstruments])
        setActiveTracks([...playableTracksIndexes])
        return function cleanup() {
            setInstruments([userInstrument])
        }
    }, [midiMetas])

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
                {midiMetas ? <MidiFileMetas midiMetas={midiMetas} midiTitle={midiTitle} /> : null}
                <Preview
                    appMode={appMode}
                    midiCurrentTime={midiCurrentTime}
                    midiFile={midiFile}
                    midiMetas={midiMetas}
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
                        return (
                            <InstrumentPlayer
                                key={`${name}-${channel}`}
                                isMute={isMute}
                                audioPlayerState={audioPlayerState}
                                activeKeys={activeNotes}
                                instrument={name}
                                channel={channel}
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
