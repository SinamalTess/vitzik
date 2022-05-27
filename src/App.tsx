import './App.scss';
import {Staff} from './components/Staff';
import {MidiInputSelector} from "./components/MidiInputSelector";
import React, {useState} from "react";

function App() {
    const [inputs, setInputs] = useState<MIDIInput[]>([])

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
        console.log(event.target.value)
    }

  return (
    <div className="App">
        <MidiInputSelector inputs={inputs} onChangeInput={onChangeInput} />
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
