#!/bin/bash

# Enhanced Google API Test Script
# Tests with correct parameters for newer APIs

API_KEY="AIzaSyDmtGCxWbuNcL4TQBvS9eESumGltyaXFMI"
LAT="30.900"
LNG="75.880"

echo "🔍 ENHANCED GOOGLE API TESTING"
echo "=============================="
echo ""

# Test Air Quality API with correct format
echo "🌬️ Testing Air Quality API (Enhanced):"
curl -s "https://airquality.googleapis.com/v1/currentConditions:lookup?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG" | jq '.' 2>/dev/null || echo "Response: $(curl -s "https://airquality.googleapis.com/v1/currentConditions:lookup?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG")"
echo ""

# Test Solar API with correct format
echo "☀️ Testing Solar API (Enhanced):"
curl -s "https://solar.googleapis.com/v1/dataLayers:get?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG&view=FULL_LAYERS" | jq '.' 2>/dev/null || echo "Response: $(curl -s "https://solar.googleapis.com/v1/dataLayers:get?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG&view=FULL_LAYERS")"
echo ""

# Test Pollen API with correct format
echo "🌻 Testing Pollen API (Enhanced):"
curl -s "https://pollen.googleapis.com/v1/forecast:lookup?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG&days=1&plants=GRASS,WEED,TREE" | jq '.' 2>/dev/null || echo "Response: $(curl -s "https://pollen.googleapis.com/v1/forecast:lookup?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG&days=1&plants=GRASS,WEED,TREE")"
echo ""

# Test Weather API with correct format
echo "🌤️ Testing Weather API (Enhanced):"
curl -s "https://weather.googleapis.com/v1/currentConditions:lookup?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG" | jq '.' 2>/dev/null || echo "Response: $(curl -s "https://weather.googleapis.com/v1/currentConditions:lookup?key=$API_KEY&location.latitude=$LAT&location.longitude=$LNG")"
echo ""

# Test Maps Datasets API
echo "📊 Testing Maps Datasets API (Enhanced):"
curl -s "https://mapsplatform.googleapis.com/maps/datasets/v1?key=$API_KEY" | jq '.' 2>/dev/null || echo "Response: $(curl -s "https://mapsplatform.googleapis.com/maps/datasets/v1?key=$API_KEY")"
echo ""

# Test Map Tiles API with correct format
echo "🎯 Testing Map Tiles API (Enhanced):"
curl -s -I "https://tile.googleapis.com/v1/2dtiles/1/0/0?key=$API_KEY" | head -1
echo ""

echo "✅ Enhanced testing complete!"
echo "Check responses above for detailed API data"
