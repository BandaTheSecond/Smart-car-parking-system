# Smart-car-parking-system
Videourl: https://youtu.be/X5SRARH3Oh8
## OVERVIEW
A web-based parking management application that allows users to:

1.View available parking spots across multiple car parks
2.Park vehicles by selecting available spots
3.Track parking history and spot occupancy
4.Manage spot status in real-time

# Features
## Core Functionality
* Real-time Spot Monitoring: Visual indicators for occupied/free spots
### Parking Operations:
* Park vehicles by selecting available spots
* Remove vehicles from occupied spots
* History Tracking: Maintains log of all parking activities
* Multi-CarPark Support: Manage multiple parking locations

# Technical Details
1. Frontend: Vanilla JavaScript with async/await for API calls

2. Backend API: Expected at http://localhost:3000 with endpoints:

## /carParks  (GET, PATCH)

## /history    (GET, POST)

# Data Structure:

* Car parks with spot arrays
* spot objects with occupation status
* History entries with timestamps

# Usage
## Parking a Vehicle
* Enter license plate number
* Select car park from dropdown
* Submit form - system automatically assigns first available spot

## Freeing a Spot
* Click on an occupied spot
* Confirm removal in the dialog
* System updates status and records exit

## Viewing History
* Displays last 15 parking events
* Shows timestamps, vehicle info, and spot details

# Setup
Run "json-server --watch db.json" on the terminal to ensure our backend API is running at http://localhost:3000
 

