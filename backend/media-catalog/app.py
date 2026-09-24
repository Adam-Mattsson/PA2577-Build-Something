import json
import os
import requests
from flask import app, request
import db
# Environmental variables
SEARCH_SERVICE_URL = os.environ.get("SEARCH_SERVICE_URL")

db.init_db()  # Setup db tables on startup

app = app.Flask(__name__)


@app.route('/search', methods=['GET'])
def external_search_media():
    """Searches for a movie using the external search API and returns the movie information of the movie."""
    title = request.args.get("search")
    formatted_title = title.replace(" ", "+")
    response = requests.get(
        f"{SEARCH_SERVICE_URL}/justwatch?q={formatted_title}&L=en_IN")
    json_data = json.loads(response.text)
    return json_data["description"]


def searchCachedMovies(title: str):
    """Searches for a movie in the db cache and returns the movie information if found."""
    pass


@app.route('/media/save', methods=['POST'])
def saveMedia():
    """Saves a media item/s to the user's collection."""
    media_data = request.get_json()
    db.save_medias(media_data)
    return {"message": "Media saved"}, 200


@app.route('/stored', methods=['GET'])
def saved():
    """Saves a media item/s to the user's collection."""
    media = db.get_stored()
    print(media)
    return {"message": json.dumps(media)}, 200
