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

You can override this by setting a search center (latitude, longitude, zoom) for your specific map file. When you click on the 'Set as search center' button, the current search center is only set temporarily for that session. To permanently set the search center, you need to click on "copy config" and replace the content in the config.json file with it, or else the search center will be reset to the default when you restart the app.

> Why is searching for a place so weird? Why should I set the search center?
> Covered in the **WHY** section.


### How to set markers?
You can draw markers/features onto a map by using the panel on the right. You can choose from lines, points, circles, rectangles and draw custom polygons.
These drawings will stay on your map for the rest of the session, but they will be lost when you restart the app.

To save your markers, you need to click on "copy config" and paste the content in the config.json file.

**Deleting markers:**
- The delete button on the top-right panel will delete the markers you have drawn in the current session.
- The markers that have been loaded from the saved config file can be deleted using the button on the bottom-right panel.




