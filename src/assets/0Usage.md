# How to use offline-osm-viewer?

### How to search for a place?
To search for a place, you can type in your search query in the search bar and click on the search button.

The search query is a list of place names separated by "**>**" character.
These place names must be in the order of the hierarchy of the place. You will need to know the rough address of the location you are looking for.

For example, if you are looking for the Lalbagh in Bangalore, india,
you can search as follows.

***
```
karnataka > bengaluru > lalbagh
```
***

This follows the order of "state > city > place of interest"

- Queries are case insensitive.
- Make sure to use the exact spelling for the place names.
- Experiment with zoom levels of different hierarchy levels in config.ini to find the best match.

#### What does the "Set as search center" button do?

This button sets the current location and zoom level as the search center. This means that the initial search will be for the place at the current location and zoom level. By default, the search center is calculated based on mean of the left-right, top-bottom bounds of the map.

Search centers can also be set on the config.ini file.
#
> Why is searching for a place so weird? 
> Covered in the **WHY** section.




