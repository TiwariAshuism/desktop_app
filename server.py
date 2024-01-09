from flask import Flask, jsonify, Response, stream_with_context
import json
from flask_cors import CORS  # Install with: pip install flask-cors
import random
import math
from adafruit_ble import BLERadio
from adafruit_ble.services.nordic import UARTService
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/get_data', methods=['GET'])
def get_data():
    # Your data generation logic here
    # For simplicity, a sample data is provided
    data = [{'x': i, 'y': math.floor(random.random() * 100)} for i in range(1200)]
    return jsonify(data)

def generate_scan_results():
    radio = BLERadio()
    print("scanning")
    found = set()
    for entry in radio.start_scan(timeout=60, minimum_rssi=-80):
        addr = entry.address
        if addr not in found and entry.complete_name is not None:
           yield (json.dumps({"device_name": entry.complete_name}) + '\n').encode('utf-8')
        found.add(addr)
CORS(app)
@app.route('/start_scan', methods=['GET'])
def start_scan():
    return Response(stream_with_context(generate_scan_results()), content_type='application/json')
@app.route('/connect/<string:device_name>', methods=['POST'])
def connect(device_name):
    try:
        # Scan for the device with the specified name
        radio = BLERadio()
        target_device = None
        for entry in radio.start_scan(timeout=60, minimum_rssi=-80):
            if entry.complete_name == device_name:
                target_device = entry
                break

        if target_device:
            # Establish a connection to the target device
            ble_connection = radio.connect(target_device, timeout=10)

            # Your connection logic here, e.g., interacting with the connected device
            print(f"Connected to device with name: {device_name}")
            if(ble_connection.connected):
                uart_service = UARTService(radio)
                print(uart_service.read(20));
            

            # For demonstration purposes, return a success message
            return jsonify({"status": "connected", "device_name": device_name})
        else:
            return jsonify({"status": "error", "message": f"Device with name '{device_name}' not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True,port=5000)



