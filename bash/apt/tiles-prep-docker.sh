#!/bin/bash

# install git, docker, docker-compose, tilemaker and pmtiles
sudo apt install git
sudo apt install docker
sudo apt install docker-compose

git clone https://github.com/mapbox/tilemaker.git
cd tilemaker
sudo docker build -t tilemaker .

cd ..

sudo apt install pmtiles
