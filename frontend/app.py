from flask import Flask, render_template, request
import os
import requests

app = Flask(__name__)

MEDIA_CATALOG_SERVICE_URL = os.environ.get("MEDIA_CATALOG_SERVICE_URL")

@app.route('/search', methods=['GET'])
def searchMedia():
    searchQuery = request.args.get('search')
    print(searchQuery)
    response = requests.get(f"{MEDIA_CATALOG_SERVICE_URL}/search", params={'search': searchQuery})
    print(response)
    return response.json()

@app.route('/', methods=['GET'])
def home():
    searchResult = []
    if(request.method == 'GET'):
        searchQuery = request.args.get('search')
        if searchQuery:
            searchResult = searchMedia()
            # Relevant display attributes: {id, type, title, year, runtime, photo_url}
    return render_template(
        'home.html', 
        items=searchResult, 
        searchQuery=searchQuery if searchQuery else "")


@app.route('/saved', methods=['GET', 'POST'])
def saved():
    return render_template('saved.html')