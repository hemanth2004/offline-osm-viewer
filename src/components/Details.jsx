import './Details.css'
import { useRef } from 'react';
import PropTypes from 'prop-types';
import { CodeBlock } from 'react-code-blocks';

function Details({
    filePath,
    mapDetails,
    liveDetails,
    setIsOpen,
    setSearchQuery,
    latestSearchResult
}) {
    const searchInputRef = useRef(null);

    const handlePointClick = () => {
        if (searchInputRef.current) {
            setSearchQuery(searchInputRef.current.value);
        }
    };

    const getFileName = (filePath) => {
        return filePath.split('/').pop().split('.').shift();
    }

    const getFileExtension = (filePath) => {
        return filePath.split('.').pop();
    }

    const generateSearchCenterCode = () => {
        const center = [mapDetails.center[1], mapDetails.center[0]];
        const code = `[[search_center.perMap]]\nfileName = "${getFileName(filePath)}.${getFileExtension(filePath)}"\nlatitude = ${center[0]}\nlongitude = ${center[1]}\nzoom = ${mapDetails.zoom}`
        return code;
    }

    const copySearchCenter = () => {
        const code = generateSearchCenterCode();
        navigator.clipboard.writeText(code);
        return code;
    }

    return (
        <div className="map-details">
            <div className="det-header">
                <h2>{getFileName(filePath)}.<span className='det-file-ext'>{getFileExtension(filePath)}</span></h2>
                {mapDetails && mapDetails.header && mapDetails.metadata && (
                    <div className="map-stats">
                        <div className='map-stats-static'>
                            <div className='map-stats-static-left'>
                                <p>CENTER @ {
                                    mapDetails.center ? mapDetails.center[1] : mapDetails.header.centerLon
                                }°N, {
                                        mapDetails.center ? mapDetails.center[0] : mapDetails.header.centerLat
                                    }°E</p>
                                <p>ZOOM {mapDetails.zoom}x</p>
                                <p>LAYERS {mapDetails.metadata.vector_layers?.length || 0}</p>
                                <ul>COVERAGE
                                    <li>[↑] {mapDetails.header.minLat.toFixed(2)}°N to {mapDetails.header.maxLat.toFixed(2)}°N</li>
                                    <li>[→] {mapDetails.header.minLon.toFixed(2)}°E to {mapDetails.header.maxLon.toFixed(2)}°E</li>
                                </ul>
                            </div>
                            <div className='map-stats-static-right'>
                                <button className='map-stats-static-right-btn' onClick={copySearchCenter}>
                                    COPY
                                </button>
                                <div className='map-stats-static-right-copy'>
                                    <CodeBlock
                                        text={generateSearchCenterCode()}
                                        language="cpp"
                                        showLineNumbers={true}
                                        wrapLines
                                    />
                                </div>
                            </div>
                        </div>
                        {liveDetails &&
                            <div className='det-live'>
                                <p>LIVE</p>
                                <span>{liveDetails?.lngLat?.lng}°E, {liveDetails?.lngLat?.lat}°N</span><br />
                                <span>Zoom: {liveDetails?.zoom}x</span>
                            </div>
                        }
                    </div>

                )}
            </div>
            <button className='det-btn det-btn-thin' onClick={() => setIsOpen(true)}>How to use</button>
            <hr />
            <div className='det-search-container'>
                <textarea
                    spellCheck="false"
                    ref={searchInputRef}
                    className="det-search"
                    placeholder='Search places'
                    rows={7}
                />
                <button
                    className="det-btn"
                    onClick={handlePointClick}
                >
                    Search
                </button>
                <div className='det-search-r'>
                    {latestSearchResult != {} ?
                        <>
                            <p className='det-search-r-title'>{latestSearchResult.found ? "Found a match" : "No match found"}</p>
                            {latestSearchResult.found &&
                                <div className='det-search-inner'>
                                    <h2>{latestSearchResult.location?.name}</h2>
                                    <h3>{latestSearchResult.location?.feature?.properties?.class}</h3>
                                    <p>{latestSearchResult.location?.feature?.properties?.layer}</p>
                                    <p>{latestSearchResult.location?.layerType}</p>
                                    <span>{latestSearchResult.location?.coordinates[0].toFixed(2)}°E, {latestSearchResult.location?.coordinates[1].toFixed(2)}°N</span>
                                </div>
                            }
                        </> :
                        <div>Search for a place to see details</div>
                    }
                </div>
            </div>
        </div >
    )
}

Details.propTypes = {
    filePath: PropTypes.string.isRequired,
    mapDetails: PropTypes.object,
    liveDetails: PropTypes.object,
    setSearchQuery: PropTypes.func.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    latestSearchResult: PropTypes.shape({
        found: PropTypes.bool,
        location: PropTypes.shape({
            name: PropTypes.string,
            coordinates: PropTypes.arrayOf(PropTypes.number),
            feature: PropTypes.shape({
                properties: PropTypes.shape({
                    class: PropTypes.string,
                    layer: PropTypes.string
                })
            }),
            layerType: PropTypes.string
        })
    })
};

export default Details