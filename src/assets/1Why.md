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

At every point, the search space is limited to the places that are available in the currently loaded tiles on the screen. This means that the place you are searching for must be within a certain proximity to the currently loaded map tiles, at that zoom level. 

On account of this, for more granular searches, you can query each component of the address of the location you are looking for, seperated by "**>**" character. The map viewer will recursively search until it reaches the exact final location you are looking for.

A typical search query would be something like this:

***
```
state > city/town > locality/suburb > place of interest
```
***




