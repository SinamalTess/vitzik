import './App.scss';
import {Staff} from './components/Staff';
import {MidiInputSelector} from "./components/MidiInputSelector";
import {MidiInputReader} from "./components/MidiInputReader";
import React, {useState} from "react";
import {noteKeyToName} from "./utils";

function App() {
    const [inputs, setInputs] = useState<MIDIInput[]>([])
    const [note, setNote] = useState<string | null>(null)

    function onMIDISuccess( midiAccess: MIDIAccess ) {

        console.log( "MIDI ready!" );

        let inputs: MIDIInput[] = []
        midiAccess.inputs.forEach(input => {
            inputs.push(input)
        })

        setInputs(inputs)
    }

    function onMIDIFailure(msg: string) {
        console.log( "Failed to get MIDI access - " + msg );
    }

    React.useEffect(() => {
        navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
    }, [])

    function onChangeInput(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedInput = event.target.value
        const input = inputs.find(e => e.id === selectedInput)
        if (input) {
            input.onmidimessage = getMIDIMessage
        }
    }

    function getMIDIMessage (message: any) {
        const command = message.data[0];
        const note = message.data[1];
        const velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

        switch (command) {
            case 144: // noteOn
                if (velocity > 0) {
                    setNote(noteKeyToName(note));
                } else {
                    setNote(null);
                }
                break;
            case 128: // noteOff
                setNote(null);
                break;
        }

    }

  return (
    <div className="App">
        <MidiInputSelector inputs={inputs} onChangeInput={onChangeInput} />
        <MidiInputReader note={note} />
      <header className="App-header">
          <Staff trebleClef />
          <br/>
          <br/>
          <Staff bassClef />
      </header>
    </div>
  );
}

export default App;
