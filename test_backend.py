#!/usr/bin/env python3
import requests
import json

# Test the backend
base_url = "http://localhost:5002/api"

print("Testing Backend...")

# Test health
try:
    r = requests.get(f"{base_url}/health", timeout=5)
    print(f"\nHealth Check: {r.status_code}")
    data = r.json()
    print(f"Status: {data.get('status')}")
    print(f"Loaded Models: {data.get('loaded_models')}")
except Exception as e:
    print(f"Health Check Error: {e}")

# Test models endpoint
try:
    r = requests.get(f"{base_url}/models", timeout=5)
    print(f"\nModels Endpoint: {r.status_code}")
    data = r.json()
    for name, info in data.get('models', {}).items():
        print(f"  - {name}: {info.get('available')} ({info.get('type')})")
except Exception as e:
    print(f"Models Error: {e}")

# Test prediction with realistic_v3_iot
try:
    features = {
        "vibration": 0.5,
        "acoustic": 60,
        "temperature": 70,
        "current": 5,
        "IMF_1": 0.1,
        "IMF_2": 0.08,
        "IMF_3": 0.06
    }
    r = requests.post(
        f"{base_url}/predict/realistic_v3_iot",
        json={"features": features},
        timeout=10
    )
    print(f"\nPrediction Test: {r.status_code}")
    data = r.json()
    if 'error' in data:
        print(f"Error: {data['error']}")
    else:
        print(f"Prediction: {data.get('prediction')}")
        print(f"Probability: {data.get('probability')}")
        print(f"Risk Level: {data.get('risk_level')}")
except Exception as e:
    print(f"Prediction Error: {e}")

# Test realtime endpoint
try:
    r = requests.get(f"{base_url}/realtime/realistic_v3_iot", timeout=10)
    print(f"\nRealtime Test: {r.status_code}")
    data = r.json()
    if 'error' in data:
        print(f"Error: {data['error']}")
    else:
        print(f"Machine ID: {data.get('machine_id')}")
        print(f"Prediction: {data.get('prediction')}")
        print(f"Probability: {data.get('probability')}")
        print(f"Risk Level: {data.get('risk_level')}")
except Exception as e:
    print(f"Realtime Error: {e}")

print("\nDone!")
