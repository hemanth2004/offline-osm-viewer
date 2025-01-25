#!/bin/bash

# Check if a file argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <input_file>"
    echo "Input file must be .pbf"
    exit 1
fi

input_file="$1"
filename=$(basename "$input_file" .pbf)

# Check if input file exists
if [ ! -f "$input_file" ]; then
    echo "Error: Input file '$input_file' not found"
    exit 1
fi

# Check if input file has .pbf extension
if [[ ! "$input_file" == *.pbf ]]; then
    echo "Error: Input file must have .pbf extension"
    exit 1
fi

echo "Starting conversion process..."

# Step 1: Convert .pbf to .geojson
echo "Converting $input_file to ${filename}.geojson..."
osmium export "$input_file" -o "${filename}.geojson"

# Step 2: Convert .geojson to .mbtiles
echo "Converting ${filename}.geojson to ${filename}.mbtiles..."
tippecanoe -o "${filename}.mbtiles" "${filename}.geojson"

echo "Conversion completed successfully!"
echo "Output file: ${filename}.mbtiles"

echo "Converting ${filename}.mbtiles to ${filename}.pmtiles..."
pmtiles convert "${filename}.mbtiles" "${filename}.pmtiles"

echo "Conversion completed successfully!"
echo "Output file: ${filename}.pmtiles"
