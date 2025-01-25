# How does this work?

## The pipeline

1. **OpenStreetMaps** is an open source initiative to create a free and editable software map of the world.
2. **Geofabrik** is a company that hosts servers that cut up the large OpenStreetMap database into smaller pieces based on continents, countries and constituencies.
3. One can download map data from these servers and use it offline.
4. **tilemaker** is a tool that converts the map data into an intermediary .mbtiles format.
5. **pmtiles** is a tool that converts the .mbtiles format into the .pmtiles format.
6. The .pmtiles format is a vector tile format that is optimized for performance and size and does not require a database.
6. **MapLibre GL JS** along with the **pmtiles.js** help render this vector tile map data onto a webpage that you host on your own computer.


***offline-osm-viewer*** tries to keep as much of this pipeline offline as possible.


