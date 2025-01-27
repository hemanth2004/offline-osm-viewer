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

## How to prep your map data?

1. Browse Geofabrik or any other map data provider and find the map data you want.
2. Choose the .osm.pbf format of the map data you want and download it.
3. First, prep your tools and files
    1. Install tilemaker, pmtiles and docker on a linux machine, or move binaries from tools_bin of this project  to your system's PATH.
    2. Setup a folder structure like this:
        ```
        xyz/
        |-- your_map_data.osm.pbf
        |-- tilemaker/ (tilemaker dockerfile is here)
        ```
4. Convert to intermediary .mbtiles format
    Run the following command in the terminal:
    ```
    sudo docker run --rm -it -v $(pwd):/srv tilemaker --input=/srv/YOUR_MAP_DATA.osm.pbf --output=/srv/$YOUR_MAP_DATA.mbtiles
    ```
    where YOUR_MAP_DATA is the name of the map data file you downloaded.
5. Convert to final .pmtiles format
    Run the following command in the terminal:
    ```
    pmtiles convert $YOUR_MAP_DATA.mbtiles $YOUR_MAP_DATA.pmtiles
    ```
6. Move this .pmtiles file to the public folder of this project.


## Running the page
1. Run the following commands

    ```
    node -v
    npm -v

    git clone https://github.com/hemanth2004/offline-osm-viewer.git
    cd offline-osm-viewer

    npm install 
    ```

2. Replace the filePath in src/App.jsx with the name of your .pmtiles file in the public folder.

3. Run the following command to start the page and make sure WebGL is enabled in your browser.
    ```
    npm run dev
    ```





