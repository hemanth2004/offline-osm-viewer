import { Map } from './components/Map';
import Details from './components/Details';
import About from './components/About';
import './styles.css'
import { useEffect, useState } from 'react';
import { useFileContent } from './hooks/useFileContent';

// karnataka > bengaluru > uttarahalli > ramanjaneya > chikkalasandra > ramanjenaya nagara park > bata > kidney foundation > carmel school
// delhi > new delhi > red fort
// karnataka > mangaluru > baikampady > navagiri nagara > surathkal > NITK main

function App() {
    // TODO: Make this dynamic
    // Filepath to the pmtiles file that is opened
    const filePath = "./public/india.pmtiles"

    const configImport = useFileContent('./public/config.json');
    const [config, setConfig] = useState({})

    const [mapDetails, setMapDetails] = useState({})
    const [liveDetails, setLiveDetails] = useState({})

    const [searchQuery, setSearchQuery] = useState("")
    const [latestSearchResult, setLatestSearchResult] = useState({})

    const [isAboutOpen, setIsAboutOpen] = useState(false)


    const reportMapDetails = (newMapDetails) => {
        let res = {
            ...mapDetails,
            ...newMapDetails
        }

        // Convert center coordinates to numbers if they're strings
        if (res.center) {
            res.center = [
                Number(res.center[0])?.toFixed(4),
                Number(res.center[1])?.toFixed(4)
            ];
        }

        // Convert zoom to number if it's a string
        if (res.zoom) {
            res.zoom = Number(res.zoom)?.toFixed(4);
        }

        setMapDetails(res)
    }

    const reportLive = (live) => {
        if (live?.lngLat?.lng != liveDetails?.lngLat?.lng || live?.lngLat?.lat != liveDetails?.lngLat?.lat) {
            setLiveDetails(live)
        }
    }

    useEffect(() => {
        if (configImport.content) {
            try {
                const parsedConfig = JSON.parse(configImport.content);
                console.log(parsedConfig)
                setConfig(parsedConfig);
            } catch (error) {
                console.error('Error parsing config.json:', error);
            }
        }
        if (configImport.error) {
            console.error('Error loading config.json:', configImport.error);
        }
    }, [configImport.content, configImport.error]);

    return (
        <div className="app">
            <Details
                filePath={filePath}
                mapDetails={mapDetails}
                liveDetails={liveDetails}
                setSearchQuery={setSearchQuery}
                latestSearchResult={latestSearchResult}
                setIsOpen={setIsAboutOpen}
            />

            <Map
                filePath={filePath}
                mapDetails={mapDetails}
                reportMapDetails={reportMapDetails}

                liveDetails={liveDetails}
                reportLive={reportLive}

                searchQuery={searchQuery}
                reportSearch={setLatestSearchResult}

                config={config}
            />

            <About
                isOpen={isAboutOpen}
                setIsOpen={() => setIsAboutOpen(false)}
            />

        </div>
    );
}

export default App
