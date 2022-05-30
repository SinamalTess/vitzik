import './App.scss'
import { Staff } from './components/Staff'
import { MidiInputSelector } from './components/MidiInputSelector'
import { MidiInputReader } from './components/MidiInputReader'
import React, { ChangeEvent, useState } from 'react'
import { noteKeyToName } from './utils'
import { Piano } from './components/Piano'
import { MusicSystemSelector } from './components/MusicSystemSelector'
import { MusicSystem } from './types/MusicSystem'
import { AlphabeticalNote } from './types/Notes'
import { MidiImporter } from './components/MidiImporter'
import { SoundController } from './components/SoundController'

function App() {
    const [inputs, setInputs] = useState<MIDIInput[]>([])
    const [notes, setNotes] = useState<AlphabeticalNote[]>([])
    const [musicSystem, setMusicSystem] = useState<MusicSystem>('syllabic')
    const [isSoundOn, setIsSoundOn] = useState<boolean>(true)

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

    function onChangeMusicSystem(musicSystem: ChangeEvent<HTMLSelectElement>) {
        setMusicSystem(musicSystem.target.value as MusicSystem)
    }

    function getMIDIMessage(message: any) {
        const command = message.data[0]
        const note = noteKeyToName(message.data[1])
        const velocity = message.data.length > 2 ? message.data[2] : 0 // a velocity value might not be included with a noteOff command

        switch (command) {
            case 144: // noteOn
                if (velocity > 0) {
                    setNotes((notes) => [...notes, note])
                } else {
                    const noteIndex = notes.findIndex((key) => key === note)
                    if (noteIndex) {
                        setNotes((notes) => notes.filter((key) => key !== note))
                    }
                }
                break
            case 128: // noteOff
                const noteIndex = notes.findIndex((key) => key === note)
                if (noteIndex) {
                    setNotes((notes) => notes.filter((key) => key !== note))
                }
                break
        }
    }

    function onKeyPressed(key: AlphabeticalNote[]) {
        setNotes(key)
    }

    return (
        <div className="App">
            <MidiInputSelector inputs={inputs} onChangeInput={onChangeInput} />
            <MidiImporter />
            <MusicSystemSelector onChangeMusicSystem={onChangeMusicSystem} />
            <MidiInputReader musicSystem={musicSystem} notes={notes} />
            <Staff notes={notes} />
            <Piano
                activeKeys={notes}
                onKeyPressed={onKeyPressed}
                isMute={!isSoundOn}
            />
            <SoundController isSoundOn={isSoundOn} toggleSound={setIsSoundOn} />
        </div>
    )
}

export default App
