import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import PropTypes from 'prop-types';

import '../utils/global-polyfill';
import { generateConfig } from '../utils/generateConfigCode';
import mapStyle from '../data/mapStyle';
import './Map.css'

const DEFAULT_CENTER = [78.9629, 20.5937]

export const Map = ({
    filePath,
    mapDetails,
    reportMapDetails,
    liveDetails,
    reportLive,
    searchQuery,
    reportSearch,
    config
}) => {

    const mapContainer = useRef(null);
    const [terraDraw, setTerraDraw] = useState(false)
    const mapRef = useRef(null);  // Store map reference

    const initialMapDetailsRef = useRef(null);

    // Init map
    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return; // Don't reinitialize if map exists or container isn't ready



        // Setup PMTiles protocol
        let protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);

        // Load PMTiles
        const p = new pmtiles.PMTiles(filePath);
        protocol.add(p);

        p.getHeader().then((header) => {

            let centerThisFrame = DEFAULT_CENTER
            // Based on bounds
            let calculateCenterAuto = true

            // Probably not needed
            if (config?.search_center?.use_this) {
                const fileName = filePath.split('\\').pop().split('/').pop();
                const savedMap = config.search_center.perMap.find(
                    map => map.fileName === fileName
                );
                if (savedMap) {
                    centerThisFrame = [savedMap.longitude, savedMap.latitude];
                    calculateCenterAuto = false; // Don't calculate center if found saved map
                    // "Found" => perMap entry with the same filename
                }
            }

            // Only calculate center from bounds if we didn't find a saved center
            if (calculateCenterAuto && header.bounds) {
                const centerLng = (header.minLon + header.maxLon) / 2;
                const centerLat = (header.minLat + header.maxLat) / 2;
                centerThisFrame = [centerLng, centerLat]
            }

            let initZoom = 5
            if (config?.search_center?.use_this) {
                const fileName = filePath.split('\\').pop().split('/').pop();
                const savedMap = config.search_center.perMap.find(
                    map => map.fileName === fileName
                );
                if (savedMap) {
                    initZoom = savedMap.zoom
                }
            }

            // Initialize MapLibre map
            mapRef.current = new maplibregl.Map({
                container: mapContainer.current,
                style: mapStyle(filePath),
                center: centerThisFrame,
                zoom: initZoom
            });

            const map = mapRef.current;

            // Add terra-draw control
            const draw = new MaplibreTerradrawControl({
                modes: [
                    'render',
                    'point',
                    'linestring',
                    'circle',
                    'angled-rectangle',
                    'select',
                    'delete-selection',
                    'delete'
                ],
                open: true,
                mode: 'render'
            });
            setTerraDraw(draw)
            map.addControl(draw, 'top-right');

            // Add markers from config if they exist
            map.on('load', () => {
                const fileName = filePath.split('\\').pop().split('/').pop();
                const mapConfig = config?.search_center?.perMap?.find(
                    map => map.fileName === fileName
                );

                if (mapConfig?.features) {
                    console.log('Loading features from config:', mapConfig.features);

                    // Add a source for all features
                    map.addSource('config-features', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [
                                // Points
                                ...mapConfig.features.points.map(point => ({
                                    type: 'Feature',
                                    geometry: point.geometry,
                                    properties: { ...point.properties, featureType: 'point' }
                                })),
                                // Lines
                                ...mapConfig.features.lines.map(line => ({
                                    type: 'Feature',
                                    geometry: line.geometry,
                                    properties: { ...line.properties, featureType: 'line' }
                                })),
                                // Circles
                                ...mapConfig.features.circles.map(circle => ({
                                    type: 'Feature',
                                    geometry: circle.geometry,
                                    properties: { ...circle.properties, featureType: 'circle' }
                                })),
                                // Rectangles
                                ...mapConfig.features.rectangles.map(rect => ({
                                    type: 'Feature',
                                    geometry: rect.geometry,
                                    properties: { ...rect.properties, featureType: 'rectangle' }
                                }))
                            ]
                        }
                    });

                    // Add point layer
                    map.addLayer({
                        id: 'config-points',
                        type: 'circle',
                        source: 'config-features',
                        filter: ['==', ['get', 'featureType'], 'point'],
                        paint: {
                            'circle-radius': 6,
                            'circle-color': '#FF0000',
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#FFFFFF'
                        }
                    });

                    // Add line layer
                    map.addLayer({
                        id: 'config-lines',
                        type: 'line',
                        source: 'config-features',
                        filter: ['==', ['get', 'featureType'], 'line'],
                        paint: {
                            'line-color': '#FF0000',
                            'line-width': 2
                        }
                    });

                    // Add polygon layers (for both circles and rectangles)
                    map.addLayer({
                        id: 'config-polygons',
                        type: 'fill',
                        source: 'config-features',
                        filter: ['in', ['get', 'featureType'], ['literal', ['circle', 'rectangle']]],
                        paint: {
                            'fill-color': '#FF0000',
                            'fill-opacity': 0.2,
                            'fill-outline-color': '#FF0000'
                        }
                    });

                    // Add polygon outline layer
                    map.addLayer({
                        id: 'config-polygon-outlines',
                        type: 'line',
                        source: 'config-features',
                        filter: ['in', ['get', 'featureType'], ['literal', ['circle', 'rectangle']]],
                        paint: {
                            'line-color': '#FF0000',
                            'line-width': 2
                        }
                    });

                    // Initialize TerraDraw with the loaded features
                    if (draw) {
                        // Convert features to TerraDraw format
                        mapConfig.features.points.forEach(point => {
                            draw.addFeature({
                                type: 'Feature',
                                geometry: point.geometry,
                                properties: {
                                    mode: 'point',
                                    ...point.properties
                                }
                            });
                        });

                        mapConfig.features.lines.forEach(line => {
                            draw.addFeature({
                                type: 'Feature',
                                geometry: line.geometry,
                                properties: {
                                    mode: 'linestring',
                                    ...line.properties
                                }
                            });
                        });

                        mapConfig.features.circles.forEach(circle => {
                            draw.addFeature({
                                type: 'Feature',
                                geometry: circle.geometry,
                                properties: {
                                    mode: 'circle',
                                    ...circle.properties,
                                    radiusKilometers: circle.properties.radiusKilometers
                                }
                            });
                        });

                        mapConfig.features.rectangles.forEach(rect => {
                            draw.addFeature({
                                type: 'Feature',
                                geometry: rect.geometry,
                                properties: {
                                    mode: 'angled-rectangle',
                                    ...rect.properties
                                }
                            });
                        });

                        // Remove the MapLibre layers since TerraDraw will handle rendering
                        ['config-points', 'config-lines', 'config-polygons', 'config-polygon-outlines'].forEach(layerId => {
                            if (map.getLayer(layerId)) {
                                map.removeLayer(layerId);
                            }
                        });

                        if (map.getSource('config-features')) {
                            map.removeSource('config-features');
                        }
                    }
                }
            });

            // Wait for map to load before adding markers
            map.on('load', () => {
                // Add markers from config if they exist
                if (config?.search_center?.perMap) {
                    const fileName = filePath.split('\\').pop().split('/').pop();
                    console.log('Current file:', fileName);
                    const mapConfig = config.search_center.perMap.find(
                        map => map.fileName === fileName
                    );
                    console.log('Found config:', mapConfig);

                    if (mapConfig?.markers?.points) {
                        console.log('Adding markers:', mapConfig.markers.points);
                        // Add a source for markers
                        map.addSource('config-markers', {
                            type: 'geojson',
                            data: {
                                type: 'FeatureCollection',
                                features: mapConfig.markers.points.map(point => ({
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: point.latLon
                                    },
                                    properties: {
                                        name: point.name
                                    }
                                }))
                            }
                        });

                        // Add marker points
                        map.addLayer({
                            id: 'config-marker-points',
                            type: 'circle',
                            source: 'config-markers',
                            paint: {
                                'circle-radius': 6,
                                'circle-color': '#FF0000',
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#FFFFFF'
                            }
                        });

                        // Add marker labels
                        map.addLayer({
                            id: 'config-marker-labels',
                            type: 'symbol',
                            source: 'config-markers',
                            layout: {
                                'text-field': ['get', 'name'],
                                'text-offset': [0, -1.5],
                                'text-anchor': 'bottom',
                                'text-size': 12
                            },
                            paint: {
                                'text-color': '#000000',
                                'text-halo-color': '#FFFFFF',
                                'text-halo-width': 2
                            }
                        });
                    }
                }
            });

            // If bounds are available, fit the map to them
            if (header.bounds) {
                map.fitBounds([
                    [header.minLon, header.minLat],
                    [header.maxLon, header.maxLat]
                ], { padding: 20 });
            }

            map.addControl(new maplibregl.NavigationControl());
            map.addControl(new maplibregl.FullscreenControl());
            // disable map rotation using right click + drag
            map.dragRotate.disable();

            // disable map rotation using keyboard
            map.keyboard.disable();

            // disable map rotation using touch rotation gesture
            map.touchZoomRotate.disableRotation();

            // Set up periodic feature checking after map is loaded
            map.once('load', () => {
                Promise.all([
                    p.getHeader(),
                    p.getMetadata()
                ]).then(([header, metadata]) => {
                    // Store initial map details in ref
                    initialMapDetailsRef.current = {
                        header: header,
                        metadata: metadata,
                        layers: map.getStyle().layers,
                        center: centerThisFrame,
                        zoom: initZoom,
                        features: {
                            points: [],
                            lines: [],
                            circles: [],
                            rectangles: []
                        }
                    };
                    // Initial report of map details
                    reportMapDetails(initialMapDetailsRef.current);

                    return
                });
            });

            // Add mouse move handler for live details
            map.on('mousemove', () => {
                reportLive({
                    lngLat: map.getCenter(),
                    zoom: map.getZoom(),
                });
            });

            // Also report on map move/zoom
            map.on('move', () => {
                reportLive({
                    lngLat: map.getCenter(),
                    zoom: map.getZoom(),
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
    }, [filePath, config]);

    // Handle search
    useEffect(() => {
        if (!mapRef.current || !searchQuery || !reportSearch || !config) return;

        const tempSearchQuery = searchQuery.trim().replace(/^>+|>+$/g, '')

        const map = mapRef.current;

        const performSearch = () => {
            try {
                const searchParts = tempSearchQuery.split('>').map(part => part.trim());
                console.log("Search hierarchy:", searchParts);

                const searchNextPart = (partIndex = 0) => {
                    if (partIndex >= searchParts.length) return;

                    const currentSearch = searchParts[partIndex];
                    //console.log(`Searching for part ${partIndex + 1}/${searchParts.length}:`, currentSearch);

                    const style = map.getStyle();
                    const symbolLayers = style.layers.filter(layer =>
                        layer.type === 'symbol' && layer.layout && layer.layout['text-field']
                    );

                    // Search in text-containing layers
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
                                setTimeout(() => {
                                    searchNextPart(partIndex + 1);
                                }, 500);
                            }
                        });
                    } else {
                        // If we can't find the current search term
                        if (partIndex > 0) {
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
                                found: false
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
                center: mapDetails.center,  // Use the state variable
                zoom: mapDetails.zoom,
                essential: true,
                speed: 5,
            });
        }, 200);

        // Wait for the view reset to complete before searching
        map.once('moveend', () => {
            console.log("View reset complete, starting search");
            performSearch();
        });

    }, [searchQuery, config]);

    // Set as search center
    const handleSetCenter = async () => {
        if (!liveDetails || !mapRef.current) return;

        const center = [liveDetails.lngLat.lng, liveDetails.lngLat.lat];
        reportMapDetails({
            ...mapDetails,
            center,
            zoom: mapRef.current.getZoom()
        });
    };

    // Get zoom level from config
    const getZoomLevel = (layer, featureClass) => {
        if (!config?.zoom_levels) {
            console.log('Config or zoom_levels not loaded yet');
            return 15;
        }

        console.log('Looking up zoom for:', { layer, featureClass });

        // Check place-specific zoom levels
        if (layer === 'place' && config.zoom_levels.place?.[featureClass]) {
            const zoom = config.zoom_levels.place[featureClass];
            console.log(`Found place zoom level: ${zoom}`);
            return zoom;
        }

        // Check layer-specific zoom levels
        if (config.zoom_levels.layers?.[layer]) {
            const zoom = config.zoom_levels.layers[layer];
            console.log(`Found layer zoom level: ${zoom}`);
            return zoom;
        }

        // Use default zoom if no specific zoom found
        const defaultZoom = config.zoom_levels.default?.zoom || 15;
        console.log(`Using default zoom: ${defaultZoom}`);
        return defaultZoom;
    };


    const copySearchCenter = () => {
        const code = generateConfig(filePath, mapDetails, config);
        navigator.clipboard.writeText(code);
        return code;
    }

    const handleDeleteDrawnFeatures = () => {
        if (!mapRef.current || !terraDraw) return;

        const map = mapRef.current;

        // Remove MapLibre layers first (these were added from config)
        ['config-points', 'config-lines', 'config-polygons', 'config-polygon-outlines'].forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
            }
        });

        // Remove MapLibre source
        if (map.getSource('config-features')) {
            map.removeSource('config-features');
        }

        // Then delete TerraDraw features
        const features = terraDraw.getFeatures();
        if (features && features.features) {
            features.features.forEach(feature => {
                terraDraw.deleteFeature(feature);
            });
        }

        reportMapDetails({
            ...mapDetails,
            features: {
                points: [],
                lines: [],
                circles: [],
                rectangles: []
            }
        });
    };

    // Check for features
    useEffect(() => {
        if (!terraDraw) return;

        const checkFeatures = () => {

            const result = terraDraw.getFeatures();
            if (result && result.features) {
                const featuresCopy = result.features.map(f => ({ ...f }));
                const organizedFeatures = {
                    points: featuresCopy
                        .filter(f => f.geometry.type === 'Point')
                        .map(f => ({
                            name: "Point",
                            geometry: f.geometry,
                            properties: f.properties
                        })),
                    lines: featuresCopy
                        .filter(f => f.geometry.type === 'LineString')
                        .map(f => ({
                            name: "LineString",
                            geometry: f.geometry,
                            properties: f.properties
                        })),
                    circles: featuresCopy
                        .filter(f => f.geometry.type === 'Polygon' && f.properties.mode === 'circle')
                        .map(f => ({
                            name: "Circle",
                            geometry: f.geometry,
                            properties: f.properties
                        })),
                    rectangles: featuresCopy
                        .filter(f => f.geometry.type === 'Polygon' && f.properties.mode === 'angled-rectangle')
                        .map(f => ({
                            name: "Rectangle",
                            geometry: f.geometry,
                            properties: f.properties
                        }))
                };

                reportMapDetails({
                    ...mapDetails,
                    features: organizedFeatures
                });
            }
        };

        const intervalId = setInterval(checkFeatures, 2000);

        return () => clearInterval(intervalId);
    }, [terraDraw, mapDetails, reportMapDetails]);


    return (
        <>
            <div
                ref={mapContainer}
                style={{
                    height: '100vh',
                    width: '75vw',
                }}
            />

            <div className='map-btn-container'>
                <button className='map-btn' onClick={copySearchCenter}>
                    Copy Config
                </button>
                <button className='map-btn' onClick={handleDeleteDrawnFeatures}>
                    Delete Drawn Features
                </button>

                <button className='map-btn' onClick={handleSetCenter}>
                    Set as search center
                </button>
            </div>
        </>
    );
};

Map.propTypes = {
    filePath: PropTypes.string.isRequired,
    mapDetails: PropTypes.object,
    reportMapDetails: PropTypes.func.isRequired,
    liveDetails: PropTypes.object,
    reportLive: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    reportSearch: PropTypes.func.isRequired,
    config: PropTypes.object
};

export default Map;