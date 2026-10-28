import json
import os
import requests
from flask import app, request

# Environmental variables
MEDIA_CATALOG_SERVICE_URL = os.environ.get("MEDIA_CATALOG_SERVICE_URL")

app = app.Flask(__name__)


@app.route('/', methods=['GET'])
def recommendation() -> dict:
    return {"message": "not yet implemented"}, 200
