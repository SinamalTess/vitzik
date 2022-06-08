import './App.scss'
import React, { useMemo, useState } from 'react'
import { getMidiInfos, midiJsonToNotes, keyToNote } from './utils'
import { Piano } from './components/Piano'
import { Settings } from './components/Settings'
import { AlphabeticalNote, MusicSystem } from './types'
import { AppMode } from './components/ModeSelector'
import { Preview } from './components/Preview'
import { IMidiFile } from 'midi-json-parser-worker'

function App() {
    const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])
    const [notes, setNotes] = useState<AlphabeticalNote[]>([])
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('syllabic')
    const [isSoundOn, setIsSoundOn] = useState<boolean>(false)
    const [appMode, setAppMode] = useState<AppMode>('import')
    const [trackPosition, setTrackPosition] = useState<number>(0)
    const [midiTrackTitle, setMidiTrackTitle] = useState<string>('')
    const [midiTrack, setMidiTrack] = useState<IMidiFile | null>(null)

    const midiInfos = useMemo(() => getMidiInfos(midiTrack), [midiTrack])
    const midiTrackNotes = midiTrack ? midiJsonToNotes(midiTrack) : []
    const midiTrackDuration = midiInfos?.trackDuration ?? 0
    const midiTrackInfos = midiInfos

    React.useEffect(() => {
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

    function onChangeMidiInput(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedInput = event.target.value // TODO: can be improved by directly passing value ?
        const input = midiInputs.find((e) => e.id === selectedInput)
        if (input) {
            input.onmidimessage = getMIDIMessage
        }
    }

    function removeNote(note: AlphabeticalNote) {
        const noteIndex = notes.findIndex((key) => key === note)
        if (noteIndex) {
            setNotes((notes) => notes.filter((key) => key !== note))
        }
    }

    function getMIDIMessage(message: any) {
        // TODO: have a more precise type
        const command = message.data[0]
        const note = keyToNote(message.data[1])
        const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

        switch (command) {
            case 144: // noteOn
                velocity > 0 ? setNotes((notes) => [...notes, note]) : removeNote(note)
                break
            case 128: // noteOff
                removeNote(note)
                break
        }
    }

    function onMidiImport(title: string, midiJSON: IMidiFile) {
        setMidiTrackTitle(title)
        setMidiTrack(midiJSON)
        console.log(midiJSON)
    }

    return (
        <div className="container">
            <div className="item">
                <Settings
                    appMode={appMode}
                    toggleSound={setIsSoundOn}
                    isSoundOn={isSoundOn}
                    midiInputs={midiInputs}
                    musicSystem={musicSystem}
                    trackPosition={trackPosition}
                    setTrackPosition={setTrackPosition}
                    midiTrackDuration={midiTrackDuration}
                    onChangeMidiInput={onChangeMidiInput}
                    onChangeAppMode={setAppMode}
                    onChangeMusicSystem={setMusicSystem}
                />
            </div>
            <div className="item">
                <Preview
                    setActiveNotes={setNotes}
                    appMode={appMode}
                    notes={notes}
                    trackPosition={trackPosition}
                    midiTrackNotes={midiTrackNotes}
                    midiTrackTitle={midiTrackTitle}
                    midiTrackInfos={midiTrackInfos}
                    onMidiImport={onMidiImport}
                />
            </div>
            <div className="item">
                <Piano activeKeys={notes} isMute={!isSoundOn} onKeyPressed={setNotes} />
            </div>
        </div>
    )
}

export default App
