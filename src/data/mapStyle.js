// Get defined CSS variables for map style
const style = getComputedStyle(document.documentElement);
const getColor = (name) => style.getPropertyValue(name).trim();

const mapStyle = (filePath) => {
    return {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
            'pmtiles-source': {
                type: 'vector',
                url: `pmtiles://${filePath.split('/').pop()}`,
                attribution: '© OpenStreetMap contributors'
            }
        },
        layers:
            [
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
    }
}

export default mapStyle;