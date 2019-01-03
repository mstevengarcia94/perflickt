# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup

def get_movie_data(index, source_url, fw, tab_level):
    source_code = requests.get(source_url)
    plain_text = source_code.text
    soup = BeautifulSoup(plain_text, "lxml")

    write_json_open_bracket(index, 'begin_object', fw, tab_level)
    tab_level += 1
    item_count = 0

    # get movie poster
    for image in soup.findAll('div', {'class': 'poster'}):
        poster = image.a.img
        poster_url = poster.get('src')
        # save image link to json here
        write_json_item(item_count, 'poster_url', poster_url, fw, tab_level)
        item_count += 1

    # get movie title and year
    #for h1 in soup.findAll('h1', {'itemprop': 'name'}):
    for title_wrapper in soup.findAll('div', {'class': 'title_wrapper'}):
        movie_title = title_wrapper.h1.text
        # save movie title to json here
        write_json_item(item_count, 'movie_title', movie_title, fw, tab_level)
        item_count += 1

        #movie_year = h1.span.a.text
        movie_year = title_wrapper.h1.span.a.text
        # save movie year to json here
        write_json_item(item_count, 'movie_year', movie_year, fw, tab_level)
        item_count += 1

    # begin genres array
    begin_json_array(item_count, 'genres', fw, tab_level)
    tab_level += 1
    genre_count = 0
    # get genres for this movie
    for span in soup.findAll('span', {'itemprop': 'genre'}):
        genre = span.text
        # save genres to json here
        write_json_item(genre_count, None, genre, fw, tab_level)
        genre_count += 1

    tab_level -= 1
    write_json_close_bracket('close_array', fw, tab_level)
    item_count += 1

    # begin directors array
    begin_json_array(item_count, 'directors', fw, tab_level)
    tab_level += 1
    director_count = 0
    # get directors
    # for outer_span in soup.findAll('span', {'itemprop': 'director'}):
    for h4 in soup.findAll(text="Director:"):
        # if the element contains "director" or "directors"
        # then iterate through all pertinent links
        #director = outer_span.a.span.text
        director = h4.parent.a.text
        # save director to json here
        write_json_item(director_count, None, director, fw, tab_level)
        director_count += 1
    tab_level -= 1
    write_json_close_bracket('close_array', fw, tab_level)
    item_count += 1

    # begin stars array
    begin_json_array(item_count, 'stars', fw, tab_level)
    tab_level += 1
    star_count = 0
    # get stars
    for outer_span in soup.findAll('span', {'itemprop': 'actors'}):
        star = outer_span.a.span.text
        # save actor to json here
        write_json_item(star_count, None, star, fw, tab_level)
        star_count += 1
    tab_level -= 1
    write_json_close_bracket('close_array', fw, tab_level)
    item_count += 1

    # get summary
    for div in soup.findAll('div', {'class': 'summary_text'}):
        summary = div.text
        # remove leading/trailing whitespace
        summary = ' '.join(summary.split())
        # replace double quotes with single quotes
        summary = summary.replace("\"", "'")
        # save summary to json here
        write_json_item(item_count, 'summary', summary, fw, tab_level)
        item_count += 1

    write_json_item(item_count, 'link', source_url, fw, tab_level)

    tab_level -= 1
    write_json_close_bracket('close_object', fw, tab_level)

def begin_json_array(index, key, fw, tab_level):
    if index:
        fw.write(',\n')
    for i in range(0, tab_level):
        fw.write('\t')

    fw.write('"' + key + '" : [\n')

def write_json_open_bracket(index, mode, fw, tab_level):
    if index:
        fw.write(',\n')
    for i in range(0, tab_level):
        fw.write('\t')

    if mode == "begin_object":
        fw.write("{\n")

def write_json_item(index, key, value, fw, tab_level):
    if index:
        fw.write(',\n')
    for i in range(0, tab_level):
        fw.write('\t')

    if key is not None:
        fw.write('"' + key + '" : "' + value.encode('utf-8') + '"')
    else:
        fw.write('"' + value.encode('utf-8') + '"')

def write_json_close_bracket(mode, fw, tab_level):
    fw.write('\n')
    for i in range(0, tab_level):
        fw.write('\t')

    if mode == "close_array":
        fw.write(']')
    if mode == "close_object":
        fw.write('}')
