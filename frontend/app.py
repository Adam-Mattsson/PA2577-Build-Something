from flask import Flask, render_template, request

app = Flask(__name__)

def searchMovie(title: str):
    import http.client
    import json
    formatted_title = title.replace(" ", "+")
    conn = http.client.HTTPSConnection("imdb.iamidiotareyoutoo.com")
    conn.request("GET", f"/justwatch?q={formatted_title}&L=en_IN")
    response = conn.getresponse()
    response_data = response.read().decode()
    json_data = json.loads(response_data)
    return json_data["description"]

@app.route('/', methods=['GET'])
def home():
    searchResult = []
    if(request.method == 'GET'):
        searchQuery = request.args.get('search')
        if searchQuery:
            searchResult = searchMovie(searchQuery)
            # Relevant display attributes: {id, type, title, year, runtime, photo_url}
            print(len(searchResult))
    return render_template(
        'home.html', 
        items=searchResult, 
        searchQuery=searchQuery if searchQuery else "")


@app.route('/saved', methods=['GET', 'POST'])
def saved():
    return render_template('saved.html')