import './App.scss'
import { Staff } from './components/Staff'
import React, { useState } from 'react'
import { MidiJsonNote, noteKeyToName } from './utils'
import { Piano } from './components/Piano'
import { MusicSystem } from './types/MusicSystem'
import { AlphabeticalNote } from './types/Notes'
import { Settings } from './components/Settings'
import { TrackInfos } from './components/TrackInfos'
import { Visualizer } from './components/Visualizer'

function App() {
    const [inputs, setInputs] = useState<MIDIInput[]>([])
    const [notes, setNotes] = useState<AlphabeticalNote[]>([])
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('syllabic')
    const [isSoundOn, setIsSoundOn] = useState<boolean>(true)
    const [midiTrackTitle, setMidiTrackTitle] = useState<string>('')
    const [midiTrackNotes, setMidiTrackNotes] = useState<MidiJsonNote[]>([])

    function onMIDISuccess(midiAccess: MIDIAccess) {
        console.log('MIDI ready!')

        let inputs: MIDIInput[] = []
        midiAccess.inputs.forEach((input) => {
            inputs.push(input)
        })

        setInputs(inputs)

        if (inputs[0]) {
            inputs[0].onmidimessage = getMIDIMessage
        }
    }

    function onMIDIFailure(msg: string) {
        console.log('Failed to get MIDI access - ' + msg)
    }

    React.useEffect(() => {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    }, [])

    function onChangeInput(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedInput = event.target.value
        const input = inputs.find((e) => e.id === selectedInput)
        if (input) {
            input.onmidimessage = getMIDIMessage
        }
    }

    function getMIDIMessage(message: any) {
        const command = message.data[0]
        const note = noteKeyToName(message.data[1])
        const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

        const clearNote = () => {
            const noteIndex = notes.findIndex((key) => key === note)
            if (noteIndex) {
                setNotes((notes) => notes.filter((key) => key !== note))
            }
        }

        switch (command) {
            case 144: // noteOn
                if (velocity > 0) {
                    setNotes((notes) => [...notes, note])
                } else {
                    clearNote()
                }
                break
            case 128: // noteOff
                clearNote()
                break
        }
    }

    function onMidiImport(title: string, notes: MidiJsonNote[]) {
        setMidiTrackTitle(title)
        setMidiTrackNotes(notes)
    }

    return (
        <div className="App">
            <Settings
                toggleSound={setIsSoundOn}
                isSoundOn={isSoundOn}
                onChangeMusicSystem={setMusicSystem}
                midiInputs={inputs}
                onChangeInput={onChangeInput}
                onMidiImport={onMidiImport}
            />
            <TrackInfos title={midiTrackTitle} />
            <Staff notes={notes} />
            <Visualizer notes={midiTrackNotes} />
            <Piano
                activeKeys={notes}
                onKeyPressed={setNotes}
                isMute={!isSoundOn}
            />
        </div>
    )
}

export default App
