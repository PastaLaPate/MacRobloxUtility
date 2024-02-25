from utils.roblox import *
from utils.LoadFFlags import loadFFLags
from flags.fflags_updater import getFflagsData
from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.constants import *
from utils.JsonUtils import merge_json
from flags.fflags_updater import updateFFlags
import re, json

app = Flask(__name__)

# All these CORS shit things
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return jsonify({'status': 'ok'})

@app.route("/openRoblox", methods=["GET"])
def open_roblox_route():
    try:
        open_roblox()
        return jsonify({'message': "success"})
    except Exception as e:
        return jsonify({'error': str(e)})
    
@app.route("/closeRoblox", methods=["GET"])
def close_roblox_route():
    try:
        close_roblox()
        return jsonify({'message': "success"})
    except Exception as e:
        return jsonify({'error': str(e)})
    
@app.route("/getConfigFFlags", methods=["GET"])
def get_config_fflags_route():
    try:
        fflags = getFflagsData()
        return jsonify({'fflags': fflags})
    except Exception as e:
        return jsonify({'error': str(e)})
    
@app.route("/getFFlags", methods=["GET"])
def get_fflags_route():
    try:
        fflags =  loadFFLags()
        return jsonify({'fflags': fflags})
    except Exception as e:
        return jsonify({'error': str(e)})
    
fflags =  loadFFLags()
@app.route("/getParsedFFLags", methods=["GET"])
def getParsedFFLags():
    try:
        return jsonify({'fflags': fflags})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route("/updateFFlags", methods=["POST"])
# Send only the FFLags to update
def update_fflags_route():
    try:
        configPath = "./flags/config/fflags.json"
        currentConfig = None
        with open(configPath, "r") as config:
            currentConfig = json.loads(config.read())
        with open(configPath, "w") as config:
            requestConfig = request.get_json(force=True) # Force to avoid to have the Content-Type: application/json header
            config.write(json.dumps(requestConfig,indent=2))
        updateFFlags()
        return jsonify({'message': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)})

app.run(host='0.0.0.0', port=39457)