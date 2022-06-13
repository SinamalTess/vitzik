import './App.scss'
import React, { useEffect, useMemo, useState } from 'react'
import { getMidiInfos, keyToNote } from './utils'
import { Keyboard } from './components/Keyboard'
import { Settings } from './components/Settings'
import { AlphabeticalNote, Instrument, MusicSystem } from './types'
import { AppMode } from './components/ModeSelector'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'
import { func } from 'prop-types'

export interface ActiveNote {
    name: AlphabeticalNote
    velocity: number
    id?: number
    duration?: number
    key: number
}

export type AudioPlayerState = 'pending' | 'playing' | 'rewinding' | 'paused'

//TODO: add error boundary
//TODO: check accessibility

function App() {
    const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])
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

    useEffect(() => {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    }, [])

    function onMIDISuccess(midiAccess: MIDIAccess) {
        const inputs: MIDIInput[] = Array.from(midiAccess.inputs.values())

        setMidiInputs(inputs)

        if (inputs[0]) {
            inputs[0].onmidimessage = getMIDIMessage
        }
    }

    function onMIDIFailure(msg: string) {
        console.error('Failed to get MIDI access - ' + msg)
    }

    function handleChangeMidiInput(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedInput = event.target.value // TODO: can be improved by directly passing value ?
        const input = midiInputs.find((e) => e.id === selectedInput)
        if (input) {
            input.onmidimessage = getMIDIMessage
        }
    }

    function removeNote(note: ActiveNote) {
        const noteIndex = activeNotes.findIndex((key) => key === note)
        if (noteIndex) {
            setActiveNotes((notes) => notes.filter((currentNote) => currentNote.name !== note.name))
        }
    }

    function getMIDIMessage(message: any) {
        // TODO: have a more precise type
        const key = message.data[1]
        const command = message.data[0]
        const name = keyToNote(message.data[1])
        const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

        const note = {
            name,
            velocity,
            key,
        }

        switch (command) {
            case 144: // noteOn
                velocity > 0 ? setActiveNotes((notes) => [...notes, note]) : removeNote(note)
                break
            case 128: // noteOff
                removeNote(note)
                break
        }
    }

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        setMidiTrackTitle(title)
        setMidiTrack(midiJSON)
        console.log(midiJSON)
        setMidiTrackCurrentTime(0)
    }

    function handleRewind(midiTrackCurrentTime: number) {
        setAudioPlayerState('rewinding')
        setMidiTrackCurrentTime(midiTrackCurrentTime)
    }

    function handlePlay(midiTrackCurrentTime: number) {
        setAudioPlayerState('playing')
        setMidiTrackCurrentTime(midiTrackCurrentTime)
    }

    function handlePause() {
        setAudioPlayerState('paused')
    }

    return (
        <div className="container">
            <div className="item">
                <Settings
                    appMode={appMode}
                    toggleSound={setIsMute}
                    isMute={isMute}
                    midiInputs={midiInputs}
                    musicSystem={musicSystem}
                    midiTrackCurrentTime={midiTrackCurrentTime}
                    midiTrackDuration={midiTrackDuration}
                    onChangeMidiInput={handleChangeMidiInput}
                    onChangeAppMode={setAppMode}
                    onChangeMusicSystem={setMusicSystem}
                    onChangeInstrument={setInstrument}
                    onPlay={handlePlay}
                    onRewind={handleRewind}
                    onPause={handlePause}
                />
            </div>
            <div className="item">
                <Preview
                    setActiveNotes={setActiveNotes}
                    appMode={appMode}
                    notes={activeNotes}
                    midiTrackCurrentTime={midiTrackCurrentTime}
                    midiTrackNotes={midiTrackNotes}
                    midiTrackTitle={midiTrackTitle}
                    midiTrackInfos={midiTrackInfos}
                    activeNotes={activeNotes}
                    onMidiImport={handleMidiImport}
                />
            </div>
            <div className="item">
                <Keyboard
                    instrument={instrument}
                    activeKeys={activeNotes}
                    isMute={!isMute}
                    musicSystem={musicSystem}
                    onKeyPressed={setActiveNotes}
                    audioPlayerState={audioPlayerState}
                />
            </div>
        </div>
    )
}

export default App
