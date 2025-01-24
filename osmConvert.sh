#!/bin/bash

# Check if a file argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <input_file>"
    echo "Input file can be .osm.pbf"
    exit 1
fi

input_file="$1"
filename=$(basename "$input_file" .osm.pbf)

# Check if input file exists
if [ ! -f "$input_file" ]; then
    echo "Error: Input file '$input_file' not found"
    exit 1
fi

# Check if input file has .osm.pbf extension
if [[ ! "$input_file" == *.osm.pbf ]]; then
    echo "Error: Input file must have .osm.pbf extension"
    exit 1
fi

echo "Starting conversion process..."

# Step 1: Convert .osm.pbf to .mbtiles
echo "Converting $input_file to ${filename}.mbtiles..."
sudo docker run --rm -it -v $(pwd):/srv tilemaker --input=/srv/$input_file --output=/srv/${filename}.mbtiles


# Check if the first conversion was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to convert to .mbtiles"
    exit 1
fi

# Step 2: Convert .mbtiles to .pmtiles
echo "Converting ${filename}.mbtiles to ${filename}.pmtiles..."
pmtiles convert "${filename}.mbtiles" "${filename}.pmtiles"

# Check if the second conversion was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to convert to .pmtiles"
    exit 1
fi

echo "Conversion completed successfully!"
echo "Output files:"
echo "- ${filename}.mbtiles"
echo "- ${filename}.pmtiles"