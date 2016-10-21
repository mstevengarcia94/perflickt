# -*- coding: utf-8 -*-

import requests, time, crawl_functions, json
from random import randint
from bs4 import BeautifulSoup, SoupStrainer

def spider(genre, year, rated):
    start = time.time()
    url = 'http://www.imdb.com/chart/top'
    source_code = requests.get(url)
    plain_text = source_code.text

    just_subnav_items = SoupStrainer(class_="subnav_item_main")
    soup = BeautifulSoup(plain_text, "lxml", parse_only=just_subnav_items)
    tab = 0

    fw = open('static/perflickt.json', 'w')

    # check all genres listed in the sidebar
    for li in soup.findAll('li', {'class': 'subnav_item_main'}):
        # if the text in a specific li element matches the passed in genre name, then go to that li element's link
        href = "http://www.imdb.com"
        current_genre = li.a.text
        current_genre = "".join(current_genre.split())
        if current_genre == genre:
            href += li.a.get('href')
            get_movie_from_year(href, year, fw, tab, start, rated)
            break

    tab -= 1
    fw.close()

    fr = open('static/perflickt.json', 'r')
    perflickt_movie = json.loads(fr.read())
    fr.close()

    return perflickt_movie

def get_movie_from_year(source_url, year, fw, tab_level, start, rated):
    year_num = int(year)
    page_count = 0
    found = False
    first_page_movies = []

    source_code = requests.get(source_url)
    plain_text = source_code.text

    just_h3_a = SoupStrainer(['h3', 'a'])
    soup = BeautifulSoup(plain_text, "lxml", parse_only=just_h3_a)

    while not found:
        # crawl the specified genre for the first movie within the given year range
        for span in soup.findAll('span', {'class': 'lister-item-year'}):
            this_movies_year = span.text.split().pop()
            this_movies_year = this_movies_year.replace("(", "").replace(")", "")
            this_movies_title = span.parent.a.text

            # get link to each movie
            href = "http://www.imdb.com"
            movie_link = span.parent.a.get("href")
            href += movie_link

            # if it's a top 50, save it
            if page_count == 0:
                first_page_movies.append(href)

            # if the year of this movie matches the desired year
            if year_num == int(this_movies_year):
                # if this movie has not been rated, call get_movie_data on the link
                if this_movies_title not in rated:
                    crawl_functions.get_movie_data(0, href, fw, tab_level)
                    found = True
                    break

        if found == True:
            break

        # if the movie was not found on this page, loop through to the next one
        link = soup.find('a', {'class': 'next-page'})

        if link is not None and page_count < 5:
            href = "http://www.imdb.com/search/title" + link.get('href')
            source_code = requests.get(href)
            plain_text = source_code.text
            soup = BeautifulSoup(plain_text, "lxml", parse_only=just_h3_a)
            page_count += 1
        else:
            # get a random top movie from specified genre
            print("LMFAO took 2 long. here's a random movie from the highest picked genre u chose")
            stop_index = len(first_page_movies)-1
            rando = randint(0, stop_index)
            href = first_page_movies[rando]
            crawl_functions.get_movie_data(0, href, fw, tab_level)
            break
