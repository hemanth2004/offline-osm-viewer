# What is the offline-osm-viewer?

offline-osm-viewer is a tool that allows you to view maps offline on your browser. 
It uses the pmtiles format to store maps and render them.
This removes the need to rely on online map services like Google Maps, Apple Maps or even the online hosted OpenStreetMap.

**This tool was made for the [doomsday-protocol](https://github.com/hemanth2004/doomsday-protocol) project.**
<br />
(https://github.com/hemanth2004/doomsday-protocol)


---
<br />

## Why is searching for a place so weird?

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


## Why should I set the search center?

The search query is a list of place names where search is recursively performed until the smallest place's location is found.

The *search center* is the coordinates, and zoom level of the map, on which the first search is performed. And there are chances that the center provided/calculated by the map is ineffective in helping searching the initial place name in the list of place names in the query. 

Therefore, in a search query like **p1 > p2 > p3**, if the search center is set accurately, the querying program will have an easier time finding **p1**.

Another example where setting a search center is useful is when the the actual part of the map you care about is a very small portion of the larger .pmtiles map you are loading.
Geofabrik, discussed in the **HOW** section of this guide, provides Singapore, Malaysia and Brunei as a single map file. A Singapore citizen only cares about Singapore, and not Malaysia or Brunei. If they set the search center to Singapore, their searches can be quicker and more accurate.


