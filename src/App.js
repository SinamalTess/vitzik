import './App.scss';
import {Staff} from './components/Staff';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Staff bassClef />
        <Staff trebleClef />
      </header>
    </div>
  );
}

export default App;
