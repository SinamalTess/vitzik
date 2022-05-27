import './App.scss';
import {Staff} from './components/Staff';

function App() {
  return (
    <div className="App">

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
