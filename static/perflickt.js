function parseJSON(file, callback) {
    var jsonFile = new XMLHttpRequest();
    
    jsonFile.overrideMimeType("application/json");
    jsonFile.open("GET", file, true);
    jsonFile.onreadystatechange = function() {
        if (jsonFile.readyState === 4 && jsonFile.status == "200") {
            callback(jsonFile.responseText);
        }
    }
    jsonFile.send(null);
}
 
// calls parseJSON to parse a json file and create the movie elements
function populateMovies() {
    parseJSON("../static/movies.json", function(text){
        // object to keep track of user's ratings
        ratingData = {
            allGenres: {},
            ratedMovies: [], // movies the user already rated
                             // aka, ones we don't want to be returned as the "perflickt" movie
            ratedTitles: []  // just the rated movie's titles (to be 
                             // sent to the server)
        };
        var obj = JSON.parse(text);
        obj.movies = scramble(obj.movies);
        createMovieElements(obj, ratingData);
    });
}

// creates the HTML elements for each movie and appends them to the movie-wrapper element
function createMovieElements(movObj, ratingData) {
    for (var i = 0; i < movObj.movies.length; i++) {
        
        // create the movie object
        var movie = movObj.movies[i];
        
        // add a genre score to each year
        for (var j = 0; j < movie.genres.length; j++) {
            var genreName = movie.genres[j];
            ratingData.allGenres[genreName] = {
                sumScore: 0,
                numMovies: 0
            };
        }

        //access movie-wrapper element
        var element = document.getElementById("movie-wrapper");
        
        // add clearfixes
        if (i % 2 == 0) {
            var clearfixEl = document.createElement("div");
            clearfixEl.setAttribute("class", "clearfix visible-sm-block");
            element.appendChild(clearfixEl);
        }
        if (i % 3 == 0) {
            var clearfixEl = document.createElement("div");
            clearfixEl.setAttribute("class", "clearfix visible-md-block visible-lg-block");
            element.appendChild(clearfixEl);
        }
        
        // create mainView elements
        var columnEl = document.createElement("div");
        columnEl.setAttribute("class", "col-md-4 col-sm-6");
        var thumbnailEl = document.createElement("div");
        thumbnailEl.setAttribute("class", "thumbnail");
        
        var mainViewEl = document.createElement("div");
        mainViewEl.setAttribute("class", "main-view center");
        var posterEl = document.createElement("div");
        var poster = document.createElement("img");
        poster.setAttribute("src", movie.poster_url);
        poster.setAttribute("class", "img-rounded");
        posterEl.appendChild(poster);
        
        mainViewEl.appendChild(posterEl);
        mainViewEl.appendChild(createItem("h3", "title", movie.movie_title, null));
        thumbnailEl.appendChild(mainViewEl);

        // create details elements
        var detailsEl = document.createElement("div");
        detailsEl.setAttribute("class", "detail-view");
        detailsEl.appendChild(createInfo(movie));
        detailsEl.appendChild(createButtons());
        
        // append everything to thumbnail, column, movie-wrapper
        thumbnailEl.appendChild(detailsEl);
        columnEl.appendChild(thumbnailEl);
        element.appendChild(columnEl);
    }
}

function createInfo(movie) {
    var infoEl = document.createElement("div");
    infoEl.setAttribute("class", "movie-info center");
    
    // append title, direc, genres, stars and summary to info
    infoEl.appendChild(createItem("h3", "title", movie.movie_title, movie.link));
    infoEl.appendChild(createItemArray("h5", "direc", "Director(s): ", movie.directors, null));
    infoEl.appendChild(createItemArray("h5", "genres", "Genres: ", movie.genres, null));
    infoEl.appendChild(createItemArray("h5", "stars", "Stars: ", movie.stars, null));
    infoEl.appendChild(createItem("p", "summary", movie.summary, null));
    
    return infoEl;
}

function createItem(tag, idName, text, link) {
    var el = document.createElement(tag);
    
    if (link != null) {
        var title = document.createElement("a");
        title.setAttribute("href", link);
        title.setAttribute("id", "title-link");
        var node = document.createTextNode(text);
        title.appendChild(node);
        el.appendChild(title);
        return el;  
    }
    else {
        el.setAttribute("id", idName);
        var node = document.createTextNode(text);
        el.appendChild(node);
        return el;
    }
}

function createItemArray(tag, idName, textId, array) {
    var el = document.createElement(tag);
    el.setAttribute("id", idName);
    var str = array.join(", ");
    var fullStr = textId + str;
    var node = document.createTextNode(fullStr);
    el.appendChild(node);
    
    return el;
}

function createButtons() { 
    var buttonsEl = document.createElement("p");
    buttonsEl.setAttribute("class", "all-buttons center");

    // append buttons to their common group
    buttonsEl.appendChild(makeButton("watched", "primary", "watchedClicked(this)"));
    buttonsEl.appendChild(makeButton("would", "success", "desireToWatchClicked(this, 'w2w')"));
    buttonsEl.appendChild(makeButton("would not", "danger", "desireToWatchClicked(this, 'dw2w')"));
    
    // create rating system but hide it
    var rating = document.createElement("div");
    rating.setAttribute("class", "rating");
    
    // create rating stars and add to ratingText
    for (var i = 0; i < 5; i++) {
        var star = document.createElement("span");
        star.setAttribute("class", "star");
        star.setAttribute("id", "star-" + (i+1).toString());
        star.setAttribute("onclick", "rateMovie(this)");
        var starText = document.createTextNode("★");
        star.appendChild(starText);
        rating.appendChild(star);
    }
    
    // add rating element to thumbnail
    buttonsEl.appendChild(rating);

    return buttonsEl;
}

function makeButton(title, btnType, onClickFunc) {
    var btn = document.createElement("a");
    var node = document.createTextNode(title);
    btn.setAttribute("class", "btn btn-" + btnType);
    btn.setAttribute("onclick", onClickFunc);
    btn.setAttribute("role", "button");
    btn.appendChild(node);

    return btn;
}

// functions to handle button click events.
function watchedClicked(el) {
    var parent = el.parentElement;
    
    // hide the button elements
    var children = parent.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].classList.contains("btn")) {
            children[i].style.opacity = 0;
            children[i].onclick = null;
            parent.removeChild(children[i]);
            i--;
        }
    }
    
    // make rating stuff visible
    var rating = parent.querySelector(".rating");
    rating.style.opacity = 1;
    rating.style.margin = "0em 0em 0em 0em";
}

function rateMovie(el) {
    var parent = el.parentElement;
    
    // get the number of this star from its id
    var id = el.id;
    var score = parseInt(id.split("-").pop());
    
    // set the color for each star (yellow or grey)
    var starCount = 1;
    for (starCount = 1; starCount <= 5; starCount++) {
        var star = parent.querySelector("#star-" + starCount.toString());
        
        if (starCount <= score) {
            star.style.color = "#ffdd44";
        }
        else {
            star.style.color = "#aaaaaa";
        }
        star.setAttribute("onclick", "null");
    }
    
    var detail = parent.parentElement.parentElement;
    detail.style.backgroundColor = "#ffffaa";
    var thumbnail = detail.parentElement;
    thumbnail.style.backgroundColor = "#ffffaa";
    incrementMovieScores(thumbnail, score);
}

function desireToWatchClicked(el, choice) {
    var parent = el.parentElement;
    
    // erase all button elements
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    
    // create h4 element
    var text = document.createElement("h4");
    var textNode = "";

    var detail = parent.parentElement;
    var thumbnail = detail.parentElement;

    if (choice == "w2w") {
        // add a green tinge to this movie's thumbnail
        textNode = document.createTextNode("would watch!");
        detail.style.backgroundColor = "#66ff88";
        thumbnail.style.backgroundColor = "#66ff88";
        
        incrementMovieScores(detail, 4);
    }
    else {
        // add a red tinge to this movie's thumbnail
        textNode = document.createTextNode("would not watch!");
        detail.style.backgroundColor = "#ff8866";
        thumbnail.style.backgroundColor = "#ff8866";
        incrementMovieScores(detail, 2);
    }
    
    text.appendChild(textNode);
    parent.appendChild(text);
}


function incrementMovieScores(thumbnail, amount) {
    // get the movie's year
    var title = thumbnail.querySelector("#title-link").innerHTML.split("&nbsp;");
    var year = title.pop();
    year = year.replace(/[^a-z0-9]+/gi, '');
    
    // get the movie's top genre
    var genres = thumbnail.querySelector("#genres").innerHTML;
    genres = genres.split(", ");
    var topGenre = genres[0].split(" ").pop();
    
    // add to genre's total rating, moviecount
    ratingData.allGenres[topGenre].sumScore += amount;
    ratingData.allGenres[topGenre].numMovies += 1;
    
    // add a movie object to ratedMovies with the specifed year, genre, and amount
    var movie = {
        movieTitle: title,
        movieYear: year,
        movieGenre: topGenre,
        movieScore: amount
    };
    ratingData.ratedMovies.push(movie);
    ratingData.ratedTitles.push(title);
    
    showPerflicktButton();
}

// function to calculate ideal movie:
function perflickt() {
    var topYear = [];
    var topGenre = [];
    var highScore = 0;
    var rated = ratingData.ratedMovies;
    
    // get highest rated year
    for (var i = 0; i < rated.length; i++) {
        var thisMovieScore = rated[i].movieScore;
        
        if (thisMovieScore > highScore) {
            topYear = [rated[i].movieYear];
            highScore = thisMovieScore;
        }
        if (thisMovieScore == highScore) {
            topYear.push(rated[i].movieYear);
        }
    }
    
    highScore = 0;
    
    // get highest rated genre
    for (var key in ratingData.allGenres) {
        var thisGenreScore = ratingData.allGenres[key].sumScore / ratingData.allGenres[key].numMovies;
        if (thisGenreScore > highScore) {
            topGenre = [key];
            highScore = thisGenreScore;
        }
        if (thisGenreScore == highScore) {
            topGenre.push[key];
        }
    }
    
    // if there are multiple years in topYear, pare it down to one year
    if (topYear.length > 1) {
        var highNumMovies = 0;
        for (var i = 0; i < topYear.length; i++) {
            if (topYear[i].numMovies >= highNumMovies) {
                highNumMovies = topYear[i].numMovies;
            }
            else {
                topYear.pop(i);
            }
        }

        if (topYear.length > 1) {
            topYear = topYear[Math.floor(Math.random() * topYear.length)];
        }
    }
    
    if (topGenre.length > 1) {
        topGenre = topGenre[Math.floor(Math.random() * topGenre.length)];
    }
    var scaleSize = 5; // how high the rating scale goes
    var cutoff = 10; // number of years away from topYear past which the weight of a particular movie will  drop below 50%
    var weightSum = 0; // sum of the calculated weights for each year
    var weightedYearSum = 0; // sum of all the years after being weighted
    
    for (var i = 0; i < rated.length; i++) {
        var score = rated[i].movieScore;
        var year = rated[i].movieYear;
        var weight = (score / 5) * (cutoff / (Math.abs(topYear - year) + cutoff));
        weightSum += weight;
        var weightedYear = weight * year;
        weightedYearSum += weightedYear;
    }
    
    // divide weightedyearsum by weightsum to the weighted average year
    topYear = Math.floor(weightedYearSum / weightSum);

    // make shade visible
    var shade = document.getElementById("shade");
    shade.style.opacity = 0.5;
    shade.style.backgroundColor = "#000000";
    shade.style.position = "fixed"; 
    shade.style.top = "0em";
    shade.style.bottom = "0em"; 
    shade.style.left = "0em"; 
    shade.style.right = "0em"; 
    shade.style.zIndex = 2;
    
    // show loading thumbnail visible
    var loading = document.getElementById("loading");
    toggleVisible(loading);
    
    // send the year and the genre to the python script
    var finalRatingData = { genre: topGenre[0], year: topYear.toString(), rated: JSON.stringify(ratingData.ratedTitles) };

    $.getJSON('/generate_perf_movie', finalRatingData, createPerflicktMovieElements );

    /*
    jQuery.ajax({
        url        : '/generate_perf_movie',
        type       : 'POST',
        traditional: true,
        data       : finalRatingData,
        dataType   : "json",
        success    : createPerflicktMovieElements,
        error      : errorFunc
    });
    */
}

function createPerflicktMovieElements(movie) {
    // get body tag
    var bod = document.getElementById("bod");
    
    // hide loading thumbnail
    var loading = document.getElementById("loading");
    toggleVisible(loading);

    // create elements
    var result = document.getElementById("result");
    var thumbnail = document.getElementById("result-thumbnail");
    var posterEl = document.createElement("img");
    posterEl.setAttribute("id", "result-poster");
    posterEl.setAttribute("src", movie.poster_url);
    var infoEl = createInfo(movie);
    posterEl.setAttribute("id", "result-info");
    
    // append the elements to the thumbnail, thumbnail to result
    thumbnail.appendChild(posterEl);
    thumbnail.appendChild(infoEl);
    result.appendChild(thumbnail);
    
    // show result thumbnail now
    toggleVisible(result);
    
    // create play again btn
    var perflicktBtn = document.getElementById("perflickt-btn");
    var parent = perflicktBtn.parentElement;
    
    // remove perflickt button
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    
    // create link element, attach to button
    var againBtn = document.createElement("a");
    againBtn.setAttribute("class", "btn btn-success");
    againBtn.setAttribute("role", "button");
    againBtn.setAttribute("onclick", "reloadTop()");
    var textNode = document.createTextNode("Play Again!");
    againBtn.appendChild(textNode);
    parent.appendChild(againBtn);
}

function toggleVisible(element) {
    var el = $(element);
    
    if (el.hasClass("no-display")) {
        el.removeClass("no-display");
        setTimeout(function () {
            el.removeClass("no-show");
        }, 20);
    }
    else {
        el.addClass("no-show");
        el.one("transitionend", function(e) {
            el.addClass("no-display");
        });
    }
}

function errorFunc() {
    
}

function scramble(obj) {
    for (var i = 0; i < obj.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (obj.length - i));

        var temp = obj[j];
        obj[j] = obj[i];
        obj[i] = temp;
    }
    return obj;
}

function showPerflicktButton() {
    if (ratingData.ratedMovies.length > 0) {
        $("#bottom-bar").slideDown({duration: 500});
    }
}

function reloadTop() {
    window.location.reload();
    $(window).scrollTop(0);
}

populateMovies();