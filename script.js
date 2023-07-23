const API_Key = "9be179c";
let currentPage = 1;
let totalResults = 0;
let currentMovieID = null;

// Initial Load

function initialLoad() {
  const initialQuery = "guardians of the galaxy";
  fetchMovies(initialQuery, 1);
}

document.addEventListener("DOMContentLoaded", initialLoad);

// Function to fetch movies using page, query
function fetchMovies(query, page) {
  const url = `https://www.omdbapi.com/?apikey=${API_Key}&s=${query}&page=${page}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.Response === "True") {
        console.log(data);
        totalResults = parseInt(data.totalResults);
        window.scrollTo(0, 0);
        renderMovies(data.Search, page);
      } else {
        console.log("No results found.");
      }
    })
    .catch((err) => {
      console.error("Error fetching data from OMDB API:", err);
    });
}

// Function to display fetched movie list
function renderMovies(movies, page) {
  const movieListElement = document.getElementById("movieList");
  movieListElement.innerHTML = "";
  const movieDetailsElement = document.getElementById("movieDetails");
  movieDetailsElement.innerHTML = "";
  const pageNumber = document.getElementById("pagenumber");
  pageNumber.textContent = page;

  movies.forEach((movie) => {
    const movieItem = document.createElement("div");
    movieItem.classList.add("movie-item");
    movieItem.innerHTML = `
      <img class="movie-poster" src="${movie.Poster}" alt="${movie.Title}">
      <div class="movie-title">${movie.Title}</div>
    `;
    movieItem.addEventListener("click", function () {
      currentMovieID = movie.imdbID;
      console.log(currentMovieID);
      displayMovieDetails(currentMovieID);
    });
    movieListElement.appendChild(movieItem);
  });
}

// Fuction to search query input from the user
function searchMovies() {
  const query = document.getElementById("searchInput").value;
  if (query !== "") {
    fetchMovies(query, 1);
  }
}

// Function to display movie details of a selected movie by the user
function displayMovieDetails(movieID) {
  const url = `https://www.omdbapi.com/?apikey=${API_Key}&i=${movieID}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      window.scrollTo(0, 0);
      const movieDetailsElement = document.getElementById("movieDetails");
      movieDetailsElement.innerHTML = `
        <div class="movie-detail-heading">
            <h2>${data.Title}</h2>
        <img src="${data.Poster}" alt="${data.Title}" class="movie-poster">
        </div>
        <div class="movie-detail-detail">
        <p><strong>Runtime:</strong> ${data.Runtime}</p>
        <p><strong>Release Date:</strong> ${data.Released}</p>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Rated:</strong> ${data.Rated}</p>
        <p><strong>Rating:</strong> ${data.imdbRating}</p>
        <p><strong>Cast:</strong> ${data.Actors}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        </div>
            <div class="user-input">
        <div class="user-rating">
          <h3>Rate this movie:</h3>
          <div class="rating">
            <span onclick="rateMovie('${movieID}', 1)">★</span>
            <span onclick="rateMovie('${movieID}', 2)">★</span>
            <span onclick="rateMovie('${movieID}', 3)">★</span>
            <span onclick="rateMovie('${movieID}', 4)">★</span>
            <span onclick="rateMovie('${movieID}', 5)">★</span>
          </div>
        </div>
        <div class="user-comments">
          <h3>User Comments:</h3>
          <input id="commentInput" placeholder="Write your comment...">
          <button onclick="addComment()">Add Comment</button>
        </div>
        </div>
      `;
      currentMovieID = data.imdbID;
      displayUserRating(movieID);
      displayUserComments(movieID);
    })
    .catch((err) => {
      console.error("Error fetching movie details from OMDB API:", err);
    });
}

// Pagination Function for displaying next page by fetching the api
function nextPage() {
  const movieDetailsElement = document.getElementById("movieDetails");
  movieDetailsElement.innerHTML = "";
  const query = document.getElementById("searchInput").value;
  if ((currentPage + 1) * 10 <= totalResults) {
    currentPage++;
    fetchMovies(query, currentPage);
  }
  window.scrollTo(0, 0);
}

// Pagination Function for displaying previous page by fetching the api
function prevPage() {
  const movieDetailsElement = document.getElementById("movieDetails");
  movieDetailsElement.innerHTML = "";

  const query = document.getElementById("searchInput").value;
  if (currentPage > 1) {
    currentPage--;
    fetchMovies(query, currentPage);
  }
  window.scrollTo(0, 0);
}

// Rating

function hasUserRated(movieID) {
  const movieRatings = JSON.parse(localStorage.getItem("movieRatings")) || [];
  return movieRatings.some((rating) => rating.movieID === movieID);
}

function rateMovie(movieID, stars) {
  if (!hasUserRated(movieID)) {
    const movieRating = {
      stars: stars,
      movieID: movieID,
    };
    // Retrieve existing movie ratings from local storage (if any)
    const movieRatings = JSON.parse(localStorage.getItem("movieRatings")) || [];
    movieRatings.push(movieRating);
    // Save the updated movie ratings back to local storage
    localStorage.setItem("movieRatings", JSON.stringify(movieRatings));

    setUserRating(movieID, stars);
  } else {
    console.error("You have already rated this movie.");
  }
}

function setUserRating(movieID, stars) {
  const starRating = document.querySelectorAll(".user-rating span");
  starRating.forEach((star, index) => {
    if (index < stars) {
      star.classList.add("rated");
    } else {
      star.classList.remove("rated");
    }
  });
}

// Comments

function hasUserCommented(movieID) {
  const movieComments = JSON.parse(localStorage.getItem("movieComments")) || [];
  return movieComments.some((comment) => comment.movieID === movieID);
}

function displayUserComments(movieID) {
  const userCommentsElement = document.querySelector(".user-comments");
  const commentInput = userCommentsElement.querySelector("#commentInput");
  const addCommentBtn = userCommentsElement.querySelector("button");

  if (hasUserCommented(movieID)) {
    const movieComments =
      JSON.parse(localStorage.getItem("movieComments")) || [];
    const commentsForMovie = movieComments.filter(
      (comment) => comment.movieID === movieID
    );
    let commentsHtml = "<h3>User Comments:</h3>";
    commentsForMovie.forEach((comment) => {
      commentsHtml += `<p>${comment.comment}</p>`;
    });
    userCommentsElement.innerHTML = commentsHtml;
  } else {
    userCommentsElement.innerHTML = `
        <h3>User Comments:</h3>
        <textarea id="commentInput" placeholder="Write your comment..."></textarea>
        <button onclick="addComment()">Add Comment</button>
      `;
    commentInput.value = "";
  }

  addCommentBtn.disabled = false;
}

function addComment() {
  const userCommentsElement = document.querySelector(".user-comments");
  const commentInput = userCommentsElement.querySelector("#commentInput");
  if (currentMovieID) {
    const comment = commentInput.value.trim();
    if (comment !== "") {
      const movieComment = {
        comment: comment,
        movieID: currentMovieID,
      };
      // Retrieve existing movie comments from local storage (if any)
      const movieComments =
        JSON.parse(localStorage.getItem("movieComments")) || [];
      movieComments.push(movieComment);
      // Save the updated movie comments back to local storage
      localStorage.setItem("movieComments", JSON.stringify(movieComments));

      // Refresh the comments display
      displayUserComments(currentMovieID);

      // Clear the comment input after adding the comment
      commentInput.value = "";
    } else {
      console.error("Comment cannot be empty.");
    }
  } else {
    console.error("No movie selected for comment.");
  }
}
