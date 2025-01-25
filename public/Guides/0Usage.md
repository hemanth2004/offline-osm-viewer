# Using offline-osm-viewer

### How to search for a place?
To search for a place, you can type in your search query in the search bar and click on the search button.

The search query is a list of place names separated by "**>**" character.
These place names must roughly be in the order of the hierarchy of the place. You will need to know the rough address of the location you are looking for. (recommend reading the **WHY** section too)

For example, if you are looking for the Lalbagh in Bangalore, india,
you can search as follows.

```
karnataka > bengaluru > lalbagh
```

This follows the order of "state > city > place of interest"

- Queries are case *insensitive*.
- But they require the exact spelling for the place names.
- Experiment with zoom levels of different hierarchy levels and search centers to find the best match.
- You can have as many components as you want in the query. Just know that every subsequent component must be within the proximity of the previous component.

#### What does the "Set as search center" button do?

This button sets the current location and zoom level as the search center. This means that the initial search will be for the place at the current location (latitude, longitude) and zoom level (a float from ~0 to ~20). 

By default, initially, the search center is calculated based on mean of the left-right, top-bottom bounds of the map. (aka "coverage")

You can override this by setting a search center (latitude, longitude, zoom) for your specific map file in the config.toml file. When you click on the 'Set as search center' button, the current search center is only set temporarily for that session. To permanently set the search center, you need to manually edit the config.toml file. 

This can go somewhere below the [search_center] section, in this format.

```
[[search_center.perMap]]
fileName = "MAP_FILE_NAME.pmtiles"
latitude = YOUR_LATITUDE
longitude = YOUR_LONGITUDE
zoom = YOUR_ZOOM
```





> Why is searching for a place so weird? Why should I set the search center?
> Covered in the **WHY** section.




