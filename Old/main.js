import { PMTiles, leafletRasterLayer } from 'pmtiles';

const map = L.map('map')
var layer = protomapsL.leafletLayer({ url: 'india.pmtiles', theme: 'light' })
layer.addTo(map)


const p = new PMTiles('india.pmtiles');
leafletRasterLayer(p).addTo(map)