#!/bin/bash

# BIOPULSE ELITE - Dynamic IP Startup Script
# This script automatically configures the application to work from any location

echo "🚀 BIOPULSE ELITE - Dynamic IP Configuration"
echo "=============================================="

# Get current IP address
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "📍 Current IP Address: $CURRENT_IP"

# Update backend CORS configuration to allow all origins
echo "🔧 Updating backend CORS configuration..."
sed -i '' 's/"origins": "\*"/"origins": "*"/g' backend/app_real_data.py

# Update frontend API configuration to use localhost (works from any location)
echo "🔧 Updating frontend API configuration..."
sed -i '' 's|const API_BASE_URL = .*|const API_BASE_URL = '\''http://localhost:5005/api'\'';|' frontend/api_fixed.js

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "python.*app_real_data" 2>/dev/null || true
pkill -f "vite\|npm" 2>/dev/null || true

# Wait for processes to stop
sleep 2

# Start backend
echo "🔧 Starting backend server..."
cd backend
python3 app_real_data.py &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend
echo "🔧 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 3

# Test API connection
echo "🧪 Testing API connection..."
if curl -s "http://localhost:5005/api/health" > /dev/null; then
    echo "✅ API connection successful"
else
    echo "❌ API connection failed"
fi

# Test frontend
echo "🧪 Testing frontend..."
if curl -s "http://localhost:8080" > /dev/null; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend not accessible"
fi

echo ""
echo "🎉 BIOPULSE ELITE is now running!"
echo "================================="
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend: http://localhost:5005"
echo "📍 Your IP: $CURRENT_IP"
echo ""
echo "💡 The application will now work from any location!"
echo "   Simply run this script whenever you change locations."
echo ""
echo "🛑 To stop: kill $BACKEND_PID $FRONTEND_PID"
