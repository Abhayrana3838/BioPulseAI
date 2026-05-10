#!/bin/bash

# Google API Services Test Script
# Tests all 14 Google API services with your API key

API_KEY="AIzaSyDmtGCxWbuNcL4TQBvS9eESumGltyaXFMI"
LOCATION="30.900,75.880"  # Ludhiana coordinates
ADDRESS="Ludhiana,India"
BASE_URL="https://maps.googleapis.com"

echo "🚀 TESTING ALL 14 GOOGLE API SERVICES"
echo "======================================"
echo "API Key: ${API_KEY:0:20}..."
echo "Location: $LOCATION"
echo ""

# Function to test API and show result
test_api() {
    local service_name="$1"
    local url="$2"
    local description="$3"
    
    echo "📍 Testing: $service_name"
    echo "   URL: $url"
    echo "   Description: $description"
    
    response=$(curl -s -w "%{http_code}" "$url")
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        echo "   ✅ STATUS: ACTIVE (HTTP $http_code)"
        if [[ "$response_body" == *"error"* ]]; then
            echo "   ⚠️  WARNING: API returned error in response"
            echo "   📄 Response: ${response_body:0:100}..."
        else
            echo "   ✅ SUCCESS: API responding correctly"
        fi
    elif [ "$http_code" = "403" ]; then
        echo "   🔒 STATUS: NEEDS API KEY ENABLEMENT (HTTP $http_code)"
        echo "   💡 Action: Enable this API in Google Cloud Console"
    elif [ "$http_code" = "400" ]; then
        echo "   ⚠️  STATUS: BAD REQUEST (HTTP $http_code)"
        echo "   💡 Check API parameters"
    else
        echo "   ❌ STATUS: ERROR (HTTP $http_code)"
        echo "   📄 Response: ${response_body:0:100}..."
    fi
    echo ""
}

# 1. Maps Static API
test_api "Maps Static API" \
    "$BASE_URL/maps/api/staticmap?center=$LOCATION&zoom=12&size=100x100&key=$API_KEY" \
    "Static map images"

# 2. Maps JavaScript API (test via geocoding)
test_api "Maps JavaScript API" \
    "$BASE_URL/maps/api/geocode/json?address=$ADDRESS&key=$API_KEY" \
    "Dynamic maps and JavaScript functionality"

# 3. Places API
test_api "Places API" \
    "$BASE_URL/maps/api/place/nearbysearch/json?location=$LOCATION&radius=1000&type=gas_station&key=$API_KEY" \
    "Place search and details"

# 4. Routes/Directions API
test_api "Routes API" \
    "$BASE_URL/maps/api/directions/json?origin=$LOCATION&destination=30.850,75.850&key=$API_KEY" \
    "Route calculation and directions"

# 5. Geocoding API
test_api "Geocoding API" \
    "$BASE_URL/maps/api/geocode/json?address=$ADDRESS&key=$API_KEY" \
    "Address to coordinates conversion"

# 6. Air Quality API
test_api "Air Quality API" \
    "https://airquality.googleapis.com/v1/currentConditions:lookup?key=$API_KEY&location=$LOCATION" \
    "Air quality data (500m resolution)"

# 7. Solar API
test_api "Solar API" \
    "https://solar.googleapis.com/v1/dataLayers:get?key=$API_KEY&location.latitude=30.900&location.longitude=75.880" \
    "Solar potential and roof analysis"

# 8. Pollen API
test_api "Pollen API" \
    "https://pollen.googleapis.com/v1/forecast:lookup?key=$API_KEY&location.latitude=30.900&location.longitude=75.880&days=1" \
    "Pollen count and allergy forecast (1km resolution)"

# 9. Maps 3D API
test_api "Maps 3D API" \
    "https://tile.googleapis.com/v1/3dtiles/root.json?key=$API_KEY" \
    "3D maps and photorealistic rendering"

# 10. Maps Datasets API
test_api "Maps Datasets API" \
    "https://mapsplatform.googleapis.com/maps/datasets/v1?key=$API_KEY" \
    "Custom geospatial data management"

# 11. Map Tiles API
test_api "Map Tiles API" \
    "https://tile.googleapis.com/v1/2dtiles/1/0/0?key=$API_KEY" \
    "2D and 3D map tiles"

# 12. Street View API
test_api "Street View API" \
    "$BASE_URL/maps/api/streetview/metadata?location=$LOCATION&key=$API_KEY" \
    "360° street view images"

# 13. Maps Embed API
test_api "Maps Embed API" \
    "https://www.google.com/maps/embed/v1/place?key=$API_KEY&q=$ADDRESS" \
    "Embedded maps for websites"

# 14. Weather API
test_api "Weather API" \
    "https://weather.googleapis.com/v1/currentConditions:lookup?key=$API_KEY&location=$LOCATION" \
    "Current weather conditions"

echo "📊 SUMMARY"
echo "=========="
echo "✅ Active APIs: Services returning HTTP 200"
echo "🔒 Need Enablement: Services returning HTTP 403 (enable in Google Cloud Console)"
echo "❌ Errors: Services with other HTTP codes"
echo ""
echo "💡 TO ENABLE ADDITIONAL APIS:"
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Select your project"
echo "3. Go to: APIs & Services → Library"
echo "4. Search and enable: Air Quality API, Solar API, Pollen API, etc."
echo ""
echo "🔍 DETAILED API USAGE:"
echo "Check your Google Cloud Console → APIs & Services → Dashboard"
echo "for detailed usage metrics and quotas"
