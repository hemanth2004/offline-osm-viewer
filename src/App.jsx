import { Map } from './components/Map';
import Details from './components/Details';
import './styles.css'
import { useState } from 'react';

// karnataka > bengaluru > uttarahalli > ramanjaneya > chikkalasandra > ramanjenaya nagara park > bata > kidney foundation > carmel school
// delhi > new delhi > red fort
// karnataka > mangaluru > baikampady > navagiri nagara > surathkal > NITK main
// tamil nadu > namakkal > kattipalayam > chettiyampalayam > pokkampalayam > edward memorial > tiruchengodu

function App() {
  const filePath = "./india.pmtiles"

  const [mapDetails, setMapDetails] = useState({})
  const [liveDetails, setLiveDetails] = useState({})

  const [searchQuery, setSearchQuery] = useState("")
  const [latestSearchResult, setLatestSearchResult] = useState({})


  const reportMapDetails = (mapDetails) => {
    console.log(mapDetails)
    setMapDetails(mapDetails)
  }
  const reportLive = (live) => {
    console.log(live)
    setLiveDetails(live)
  }

  return (
    <div className="app">
      <Details
        filePath={filePath}
        mapDetails={mapDetails}
        liveDetails={liveDetails}
        setSearchQuery={setSearchQuery}
        latestSearchResult={latestSearchResult}
      />

      <Map
        filePath={filePath}
        reportMapDetails={reportMapDetails}
        reportLive={reportLive}
        searchQuery={searchQuery}
        reportSearch={setLatestSearchResult}
      />

    </div>
  );
}

export default App
