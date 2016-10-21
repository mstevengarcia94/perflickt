import perflickt_movie_crawler
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

@app.route('/')
def rend_temp(name="perflickt"):
    return render_template('perflickt.html', project=name)

@app.route('/spicy')
def spice_world():
    return 'This is a place where you can get EXTRA SPICY!!!'

@app.route('/generate_perf_movie', methods=['GET', 'POST'])
def process_genre_year_rated():
    result = {}
    if request.method == 'GET':
        # set genre, year, and rated
        genre = request.args.get('genre', 'Animation', type=str)
        year = request.args.get('year', '2003', type=str)
        rated = request.args.get('rated', '', type=str)

        # call function to get the json, set it equal to perflickt_movie, return perflickt_movie
        result = perflickt_movie_crawler.spider(genre, year, rated)
    return jsonify(result)