
# offline-osm-viewer

offline-osm-viewer is a basic tool that allows you to view maps offline on your browser.

It uses the pmtiles format to store maps and render them. This removes the need to rely on online map services like Google Maps, Apple Maps or even the online hosted OpenStreetMap.

**This tool was made for the [doomsday-protocol](https://github.com/hemanth2004/doomsday-protocol) project.**
(https://github.com/hemanth2004/doomsday-protocol)

<details>
<summary><h2>Setup</h2></summary>
	
### How to prep your map data?

1. Browse Geofabrik or any other map data provider and find the map data you want.
2. Choose the .osm.pbf format of the map data you want and download it.
3. First, prep your tools and files
	- Install tilemaker, pmtiles and docker on a linux machine, or move binaries from tools_bin of this project to your system's PATH.
	- Setup a folder structure like this:
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
	
5. Convert to .pmtiles format
	```
	pmtiles convert $YOUR_MAP_DATA.mbtiles $YOUR_MAP_DATA.pmtiles
	```
	
6. Move this .pmtiles file to the public folder of this project.


### Running the page

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

</details>

<details>
<summary><h2>Usage</h2></summary>
	
### How to search for a place?
	
To search for a place, you can type in your search query in the search bar and click on the search button.
The search query is a list of place names separated by "**>**" character.
These place names must roughly be in the order of the hierarchy of the place. You will need to know the rough address of the location you are looking for. (recommend reading the **WHY** section too)

For example, if you are looking for the Lalbagh in Bangalore, india, you can search as follows.
```
karnataka > bengaluru > lalbagh
```
This follows the order of "state > city > place of interest"
- Queries are case *insensitive*.
- But they require the exact spelling for the place names.
- Experiment with zoom levels of different hierarchy levels and search centers to find the best match.
- You can have as many components as you want in the query. Just know that every subsequent component must be within the proximity of the previous component.
### What does the "Set as search center" button do?
This button sets the current location and zoom level as the search center. This means that the initial search will be for the place at the current location (latitude, longitude) and zoom level (a float from ~0 to ~20). 
By default, initially, the search center is calculated based on mean of the left-right, top-bottom bounds of the map. (aka "coverage")

You can override this by setting a search center (latitude, longitude, zoom) for your specific map file. When you click on the 'Set as search center' button, the current search center is only set temporarily for that session. To permanently set the search center, you need to click on "copy config" and replace the content in the config.json file with it, or else the search center will be reset to the default when you restart the app.
> Why is searching for a place so weird? Why should I set the search center?
> Covered in the **WHY** section.
> 
### How to set markers?
You can draw markers/features onto a map by using the panel on the right. You can choose from lines, points, circles, rectangles and draw custom polygons.
These drawings will stay on your map for the rest of the session, but they will be lost when you restart the app.
To save your markers, you need to click on "copy config" and paste the content in the config.json file.

**Deleting markers:**
- The delete button on the top-right panel will delete the markers you have drawn in the current session.
- The markers that have been loaded from the saved config file can be deleted using the button on the bottom-right panel.
</details>

<details>
<summary><h2>WhyandFAQ</h2></summary>
	
### Why is searching for a place so weird?

Unlike other map viewers, this one does not use an online map service or a geospatial database.

Instead it relies on vector tile map files that are stored locally on your computer.

At every point, the search space is limited to the places that are available in the currently loaded tiles on the screen. This means that the place you are searching for must be within a certain proximity to the currently loaded map tiles, at that zoom level. Zoom level is a measure of how much detail is being shown on the map. (0x - 20x)

> Higher zoom levels => more granular details like buildings, roads, etc.
> Lower zoom levels => more coarse details like countries, states, cities, etc.

On account of this, for more granular searches, you can query each component of the address of the location you are looking for, seperated by "**>**" character. The map viewer will recursively search until it reaches the exact final location you are looking for.

A typical search query would be something like this:
```
state > city/town > locality/suburb > place of interest
```  

You can have as many components as you want in the query. Just know that every subsequent component must be within the proximity of the previous component.

### Why should I set the search center?

The search query is a list of place names where search is recursively performed until the smallest place's location is found.

The *search center* is the coordinates, and zoom level of the map, on which the first search is performed. And there are chances that the center provided/calculated by the map is ineffective in helping searching the initial place name in the list of place names in the query.

Therefore, in a search query like **p1 > p2 > p3**, if the search center is set accurately, the querying program will have an easier time finding **p1**.

Another example where setting a search center is useful is when the the actual part of the map you care about is a very small portion of the larger .pmtiles map you are loading.

Geofabrik, provides Singapore, Malaysia and Brunei as a single map file. A Singapore citizen only cares about Singapore, and not Malaysia or Brunei. If they set the search center to Singapore, their searches can be quicker and more accurate.

### Why should I save config regularly?
The config.json file is used to store the map details, search center, and markers of every .pmtiles file you have opened.
Without saving the config, the map details, search center, and markers will be lost when you restart the app. Also because webpages can't write to the specific local files.
</details>


<details>
<summary><h2>Demo</h2></summary>
https://github.com/user-attachments/assets/9c587a9b-1c1a-4a9f-8656-4e741be785ed
</details>

<details>
<summary><h2>Todo:</h2></summary>
- Look for ways to get stable (LTSmaybe?) versions of maplibre-gl, pmtiles 
</details>
