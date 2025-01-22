import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';

export const Map = ({ filePath }) => {
    const mapContainer = useRef(null);

    useEffect(() => {
        // Get CSS variables
        const style = getComputedStyle(document.documentElement);
        const getColor = (name) => style.getPropertyValue(name).trim();

        // Setup PMTiles protocol
        let protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);

        // Load PMTiles
        const p = new pmtiles.PMTiles(filePath);
        protocol.add(p);

        // Debug: Log header information
        p.getHeader().then((header) => {
            console.log("PMTiles Header:", header);

            // Initialize MapLibre map
            const map = new maplibregl.Map({
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
                        }
                    ]
                },
                center: [78.9629, 20.5937],
                zoom: 5
            });

            // If bounds are available, fit the map to them
            if (header.bounds) {
                map.fitBounds([
                    [header.minLon, header.minLat],
                    [header.maxLon, header.maxLat]
                ], { padding: 20 });
            }

            map.addControl(new maplibregl.NavigationControl());

            return () => map.remove();
        }).catch(error => {
            console.error("Error loading PMTiles:", error);
        });

        // Debug: Log metadata
        p.getHeader().then((header) => {
            p.getMetadata().then((metadata) => {
                console.log("Metadata:", metadata);
                if (metadata.vector_layers) {
                    console.log("Available Layers:");
                    metadata.vector_layers.forEach(layer => {
                        console.log(`Layer Name: ${layer.id}`);
                        console.log("Attributes:", layer.fields);
                    });
                }
            }).catch(err => console.error("Error fetching metadata:", err));
        }).catch(error => {
            console.error("Error loading PMTiles:", error);
        });
    }, [filePath]);

    return (
        <div
            ref={mapContainer}
            style={{
                height: '100vh',
                width: '70vw',
            }}
        />
    );
};

export default Map;