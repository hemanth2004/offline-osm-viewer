import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import * as pmtiles from 'pmtiles';
import ini from 'ini';
import './MapStyles.css'
import 'maplibre-gl/dist/maplibre-gl.css';

export const Map = ({
    filePath,
    reportMapDetails,
    reportLive,
    searchQuery,
    reportSearch
}) => {
    const [mapDetails, setMapDetails] = useState({});
    const [mapCenter, setMapCenter] = useState([]);
    const [config, setConfig] = useState(null);
    const mapContainer = useRef(null);
    const mapRef = useRef(null);  // Store map reference

    // Load config.ini at component mount
    useEffect(() => {
        fetch('./config.ini')
            .then(response => response.text())
            .then(data => {
                const parsedConfig = ini.parse(data);
                console.log('Parsed INI config:', parsedConfig);
                setConfig(parsedConfig);
            })
            .catch(error => console.error('Error loading config:', error));
    }, []);

    useEffect(() => {
        if (mapRef.current) return; // Don't reinitialize if map exists

        // Get CSS variables
        const style = getComputedStyle(document.documentElement);
        const getColor = (name) => style.getPropertyValue(name).trim();

        // Setup PMTiles protocol
        let protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);

        // Load PMTiles
        const p = new pmtiles.PMTiles(filePath);
        protocol.add(p);

        p.getHeader().then((header) => {
            // Set initial map center based on bounds
            let centerThisFrame = [78.9629, 20.5937]
            if (header.bounds) {
                const centerLng = (header.minLon + header.maxLon) / 2;
                const centerLat = (header.minLat + header.maxLat) / 2;
                centerThisFrame = [centerLng, centerLat]
                setMapCenter(centerThisFrame);
            }
            console.log("Calculated mapCenter", centerThisFrame)

            // Initialize MapLibre map
            mapRef.current = new maplibregl.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
                    sources: {
                        'pmtiles-source': {
                            type: 'vector',
                            url: `pmtiles://${filePath.split('/').pop()}`,
                            attribution: '© OpenStreetMap contributors'
                        }
                    },
                    layers: [
                        {
                            id: 'background',
                            type: 'background',
                            paint: {
                                'background-color': getColor('--color-background')
                            }
                        },
                        {
                            id: 'landcover',
                            type: 'fill',
                            source: 'pmtiles-source',
                            'source-layer': 'landcover',
                            paint: {
                                'fill-color': [
                                    'match',
                                    ['get', 'class'],
                                    'grass', getColor('--color-grass'),
                                    'wood', getColor('--color-wood'),
                                    'forest', getColor('--color-forest'),
                                    'park', getColor('--color-park'),
                                    getColor('--color-landcover-default')
                                ]
                            }
                        },
                        {
                            id: 'waterway',
                            type: 'line',
                            source: 'pmtiles-source',
                            'source-layer': 'waterway',
                            paint: {
                                'line-color': getColor('--color-water'),
                                'line-width': [
                                    'match',
                                    ['get', 'class'],
                                    'river', 1.5,
                                    1
                                ]
                            }
                        },
                        {
                            id: 'water',
                            type: 'fill',
                            source: 'pmtiles-source',
                            'source-layer': 'water',
                            paint: {
                                'fill-color': getColor('--color-water')
                            }
                        },
                        {
                            id: 'boundary',
                            type: 'line',
                            source: 'pmtiles-source',
                            'source-layer': 'boundary',
                            paint: {
                                'line-color': getColor('--color-boundary'),
                                'line-width': [
                                    'match',
                                    ['get', 'admin_level'],
                                    10, 10,
                                    4, 1.5,
                                    1
                                ],
                                'line-dasharray': [2, 2]
                            }
                        },
                        {
                            id: 'building',
                            type: 'fill',
                            source: 'pmtiles-source',
                            'source-layer': 'building',
                            paint: {
                                'fill-color': getColor('--color-building'),
                                'fill-outline-color': getColor('--color-building-outline')
                            }
                        },
                        {
                            id: 'transportation_name',
                            type: 'symbol',
                            source: 'pmtiles-source',
                            'source-layer': 'transportation_name',
                            layout: {
                                'text-field': ['get', 'name:latin'],
                                'text-font': ['Noto Sans Regular'],
                                'text-size': 12,
                                'text-anchor': 'center',
                                'text-offset': [0, 0]
                            },
                            paint: {
                                'text-color': getColor('--color-text-secondary'),
                                'text-halo-color': getColor('--color-text-halo'),
                                'text-halo-width': 1
                            }
                        },
                        {
                            id: 'roads',
                            type: 'line',
                            source: 'pmtiles-source',
                            'source-layer': 'transportation',
                            paint: {
                                'line-color': [
                                    'match',
                                    ['get', 'class'],
                                    'motorway', getColor('--color-motorway'),
                                    'trunk', getColor('--color-trunk'),
                                    'primary', getColor('--color-primary'),
                                    'secondary', getColor('--color-secondary'),
                                    getColor('--color-secondary')
                                ],
                                'line-width': [
                                    'match',
                                    ['get', 'class'],
                                    'motorway', 4,
                                    'trunk', 3,
                                    'primary', 2,
                                    'secondary', 1.5,
                                    1
                                ]
                            }
                        },
                        {
                            id: 'poi',
                            type: 'symbol',
                            source: 'pmtiles-source',
                            'source-layer': 'poi',
                            layout: {
                                'text-field': ['get', 'name:latin'],
                                'text-font': ['Noto Sans Regular'],
                                'text-size': 11,
                                'text-anchor': 'top',
                                'text-offset': [0, 0.5]
                            },
                            paint: {
                                'text-color': getColor('--color-text-secondary'),
                                'text-halo-color': getColor('--color-text-halo'),
                                'text-halo-width': 1
                            }
                        },
                        {
                            id: 'place-labels',
                            type: 'symbol',
                            source: 'pmtiles-source',
                            'source-layer': 'place',
                            layout: {
                                'text-field': ['get', 'name:latin'],
                                'text-font': ['Noto Sans Regular'],
                                'text-size': [
                                    'match',
                                    ['get', 'class'],
                                    'city', 14,
                                    'town', 12,
                                    'village', 11,
                                    10
                                ]
                            },
                            paint: {
                                'text-color': getColor('--color-text'),
                                'text-halo-color': getColor('--color-text-halo'),
                                'text-halo-width': 2
                            }
                        },
                        {
                            id: 'water_name',
                            type: 'symbol',
                            source: 'pmtiles-source',
                            'source-layer': 'water_name',
                            layout: {
                                'text-field': ['get', 'name:latin'],
                                'text-font': ['Noto Sans Regular'],
                                'text-size': 12,
                                'text-anchor': 'center'
                            },
                            paint: {
                                'text-color': getColor('--color-water-text'),
                                'text-halo-color': getColor('--color-text-halo'),
                                'text-halo-width': 1
                            }
                        },
                        {
                            id: 'mountain_peak',
                            type: 'symbol',
                            source: 'pmtiles-source',
                            'source-layer': 'mountain_peak',
                            layout: {
                                'text-field': ['get', 'name:latin'],
                                'text-font': ['Noto Sans Regular'],
                                'text-size': 11,
                                'text-anchor': 'top',
                                'text-offset': [0, 0.5]
                            },
                            paint: {
                                'text-color': getColor('--color-mountain-text'),
                                'text-halo-color': getColor('--color-text-halo'),
                                'text-halo-width': 1
                            }
                        },
                        {
                            id: 'park',
                            type: 'fill',
                            source: 'pmtiles-source',
                            'source-layer': 'park',
                            paint: {
                                'fill-color': getColor('--color-park'),
                                'fill-opacity': 0.7
                            }
                        }
                    ]
                },
                center: centerThisFrame,
                zoom: 5
            });

            const map = mapRef.current;

            // If bounds are available, fit the map to them
            if (header.bounds) {
                map.fitBounds([
                    [header.minLon, header.minLat],
                    [header.maxLon, header.maxLat]
                ], { padding: 20 });
            }

            map.addControl(new maplibregl.NavigationControl());

            // Report map details once after map is loaded
            map.once('load', () => {
                Promise.all([
                    p.getHeader(),
                    p.getMetadata()
                ]).then(([header, metadata]) => {
                    const mapDetails = {
                        header: header,
                        metadata: metadata,
                        layers: map.getStyle().layers
                    };
                    reportMapDetails(mapDetails);
                    setMapDetails(mapDetails);
                    setMapCenter(centerThisFrame);
                });
            });
        }).catch(error => {
            console.error("Error loading PMTiles:", error);
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Empty dependency array since we're using refs

    // New effect for handling search
    useEffect(() => {
        if (!mapRef.current || !searchQuery || !reportSearch || !config) return;

        // Remove leading '>' characters from the search query
        searchQuery = searchQuery.trim().replace(/^>+/, '')

        const map = mapRef.current;

        // Function to perform search
        const performSearch = () => {
            try {
                // Split search into hierarchical parts
                const searchParts = searchQuery.split('>').map(part => part.trim());
                console.log("Search hierarchy:", searchParts);

                // Function to search for a specific part after moving to previous location
                const searchNextPart = (partIndex = 0) => {
                    if (partIndex >= searchParts.length) return;

                    const currentSearch = searchParts[partIndex];
                    console.log(`Searching for part ${partIndex + 1}/${searchParts.length}:`, currentSearch);

                    // Get all available layers from the map style
                    const style = map.getStyle();
                    const symbolLayers = style.layers.filter(layer =>
                        layer.type === 'symbol' && layer.layout && layer.layout['text-field']
                    );

                    // Search through all text-containing layers
                    let foundFeature = null;
                    let foundLayer = null;

                    for (const layer of symbolLayers) {
                        const layerFeatures = map.querySourceFeatures('pmtiles-source', {
                            sourceLayer: layer['source-layer'],
                            filter: ['in', currentSearch.toLowerCase(), ['downcase', ['get', 'name:latin']]]
                        });

                        if (layerFeatures.length > 0) {
                            foundFeature = layerFeatures[0];
                            foundLayer = layer['source-layer'];
                            break;
                        }
                    }

                    if (foundFeature) {
                        // Preserve ALL properties including internal ones
                        const feature = Object.assign(Object.create(Object.getPrototypeOf(foundFeature)), foundFeature, {
                            sourceLayer: foundLayer
                        });

                        console.log(`Found feature for "${currentSearch}" in layer ${foundLayer}:`, feature);

                        // Extract and validate coordinates
                        let coordinates;
                        if (feature.geometry.type === 'Point') {
                            coordinates = feature.geometry.coordinates;
                        } else if (feature.geometry.type === 'Polygon') {
                            const bounds = new maplibregl.LngLatBounds();
                            feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord));
                            coordinates = bounds.getCenter().toArray();
                        } else if (feature.geometry.type === 'LineString') {
                            const coords = feature.geometry.coordinates;
                            const middleIndex = Math.floor(coords.length / 2);
                            coordinates = coords[middleIndex];
                        } else if (feature.geometry.type === 'MultiLineString') {
                            const allCoords = feature.geometry.coordinates.flat();
                            const middleIndex = Math.floor(allCoords.length / 2);
                            coordinates = allCoords[middleIndex];
                        } else {
                            console.log("Feature geometry:", feature.geometry);
                            console.error("Unsupported geometry type:", feature.geometry.type);
                            return;
                        }

                        // Validate coordinates
                        if (!coordinates || coordinates.length !== 2 ||
                            !isFinite(coordinates[0]) || !isFinite(coordinates[1])) {
                            console.error("Invalid coordinates:", coordinates);
                            reportSearch({
                                found: false,
                                message: `Found "${currentSearch}" but location coordinates are invalid`
                            });
                            return;
                        }

                        //console.log(`Using coordinates [${coordinates}] for feature type ${feature.geometry.type}`);

                        // Determine zoom level using config
                        let zoom = getZoomLevel(foundLayer, feature.properties.class);

                        console.log("Zoom level:", zoom);

                        // Fly to the location with configured zoom
                        map.flyTo({
                            center: coordinates,
                            zoom: zoom,
                            essential: true,
                            speed: 2,
                        });

                        // Wait for movement to complete
                        map.once('moveend', () => {
                            if (partIndex === searchParts.length - 1) {
                                // This is the final destination
                                reportSearch({
                                    found: true,
                                    location: {
                                        name: feature.properties['name:latin'],
                                        coordinates: coordinates,
                                        feature: feature,
                                        layer: foundLayer,
                                        layerType: feature.geometry.type,
                                        class: feature.properties.class || 'unknown'
                                    }
                                });
                            } else {
                                // Wait a bit for tiles to load before searching next part
                                setTimeout(() => {
                                    searchNextPart(partIndex + 1);
                                }, 500);
                            }
                        });
                    } else {
                        // If we can't find the current search term
                        if (partIndex > 0) {
                            // If this isn't the first search term, report the previous successful location
                            reportSearch({
                                found: true,
                                location: {
                                    name: searchParts[partIndex - 1],
                                    coordinates: map.getCenter().toArray(),
                                    feature: null,
                                    layer: null,
                                    layerType: null,
                                    class: 'unknown'
                                },
                                message: `Could not find "${currentSearch}" within the current view`
                            });
                        } else {
                            // If this is the first search term and it's not found
                            reportSearch({
                                found: false,
                                message: `No location found matching "${currentSearch}"`
                            });
                        }
                    }
                };

                // Start the search from the first part
                searchNextPart(0);

            } catch (error) {
                console.error("Search error:", error);
                reportSearch({
                    found: false,
                    message: "Error during search"
                });
            }
        };

        setTimeout(() => {
            map.flyTo({
                center: mapCenter,  // Use the state variable
                zoom: 4.5,
                essential: true,
                speed: 5,
            });
        }, 200);

        // Wait for the view reset to complete before searching
        map.once('moveend', () => {
            console.log("View reset complete, starting search");
            performSearch();
        });

    }, [searchQuery, config]); // Add config to dependencies

    const handleSetCenter = () => {
        const currentViewCoordinates = mapRef.current.getCenter().toArray();
        setMapCenter(currentViewCoordinates);
        reportMapDetails({
            ...mapDetails,
            center: currentViewCoordinates
        });
    }

    // Get current coordinates for display
    const getCurrentCoordinates = () => {
        if (!mapRef.current) return '';
        const center = mapRef.current.getCenter();
        return `[${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}]`;
    }

    // In your search functionality, replace hardcoded zoom levels with config values
    const getZoomLevel = (layer, featureClass) => {
        if (!config) {
            console.log('Config not loaded yet');
            return 15;
        }

        console.log('Looking up zoom for:', { layer, featureClass });

        if (layer === 'place' && config.place && config.place[featureClass]) {
            const zoom = parseFloat(config.place[featureClass]);
            console.log(`Found place zoom level: ${zoom}`);
            return zoom;
        }

        if (config.layers && config.layers[layer]) {
            const zoom = parseFloat(config.layers[layer]);
            console.log(`Found layer zoom level: ${zoom}`);
            return zoom;
        }

        const defaultZoom = parseFloat(config.default.zoom) || 15;
        console.log(`Using default zoom: ${defaultZoom}`);
        return defaultZoom;
    };

    return (
        <>
            <div
                ref={mapContainer}
                style={{
                    height: '100vh',
                    width: '75vw',
                }}
            />

            <button className='map-btn' onClick={handleSetCenter}>
                Set as search center
            </button>
        </>
    );
};

export default Map;