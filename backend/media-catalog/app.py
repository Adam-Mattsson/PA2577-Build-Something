import json
import os
import requests
from flask import app, request

#Environmental variables
SEARCH_SERVICE_URL = os.environ.get("SEARCH_SERVICE_URL")


app = app.Flask(__name__)

@app.route('/search', methods=['GET'])
def externalSearchMovie():
    """Searches for a movie using the external search API and returns the movie information of the movie."""
    title = request.args.get("search")
    formatted_title = title.replace(" ", "+")
    response = requests.get(f"{SEARCH_SERVICE_URL}/justwatch?q={formatted_title}&L=en_IN")
    json_data = json.loads(response.text)
    return json_data["description"]

def searchCachedMovies(title: str):
    """Searches for a movie in the db cache and returns the movie information if found."""
    pass
