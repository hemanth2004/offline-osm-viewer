#!/bin/bash

sudo apt-get install osmium-tool
sudo apt-get install tippecanoe


osmium cat india-latest.osm.pbf | tippecanoe -o india.pmtiles -z14 -Z12

python3 -m http.server

