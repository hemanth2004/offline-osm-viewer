import { Map } from './components/Map';
import './styles.css'

function App() {
  const filePath = "./india.pmtiles"

  return (
    <div className="app">
      <header>
        <h3>{filePath}</h3>
      </header>
      <Map filePath={filePath} />

    </div>
  );
}

export default App
