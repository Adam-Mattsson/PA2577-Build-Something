from flask import Flask, render_template, request
import os
import requests
import json

app = Flask(__name__)

MEDIA_CATALOG_SERVICE_URL = os.environ.get("MEDIA_CATALOG_SERVICE_URL")


@app.route('/search', methods=['GET'])
def search_media():
    searchQuery = request.args.get('search')
    print(searchQuery)
    response = requests.get(
        f"{MEDIA_CATALOG_SERVICE_URL}/search", params={'search': searchQuery})
    print(response)
    return response.json()


@app.route('/media/save', methods=['POST'])
def save_media():
    media_data = request.get_json()
    response = requests.post(
        f"{MEDIA_CATALOG_SERVICE_URL}/media/save", json=media_data)
    return response.json()


@app.route('/', methods=['GET'])
def home():
    searchResult = []
    if (request.method == 'GET'):
        searchQuery = request.args.get('search')
        if searchQuery:
            searchResult = search_media()
            # Relevant display attributes: {id, type, title, year, runtime, photo_url}
    return render_template(
        'home.html',
        items=searchResult,
        searchQuery=searchQuery if searchQuery else "")


def get_stored_media():
    response = requests.get(f"{MEDIA_CATALOG_SERVICE_URL}/stored",)
    return response.json()


@app.route('/stored', methods=['GET', 'POST'])
def saved():
    saved = get_stored_media()
    extracted_data = json.loads(saved['message'])
    print(extracted_data)
    return render_template('stored.html', items=extracted_data)
