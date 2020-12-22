import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import VisibilityFilterInput from "../visibility-filter-input/visibility-filter-input";
import { MovieCard } from "../movie-card/movie-card";

const mapStateToProps = state => {
  const { visibilityFilter } = state;
  return { visibilityFilter };
};

function MoviesList(props) {
  const {
    movies,
    visibilityFilter,
    favoriteMovies,
    setUserFavoriteMovie
  } = props;

  let filteredMovies = movies;

  if (visibilityFilter !== "") {
    filteredMovies = movies.filter(m => m.Title.includes(visibilityFilter));
  }

  if (!movies) return <div className="main-view" />;

  return (
    <div className="movies-list">
      <VisibilityFilterInput visibilityFilter={visibilityFilter} />
      {filteredMovies.map(m => (
        <MovieCard
          key={m._id}
          movie={m}
          added={favoriteMovies.includes(m._id)}
          setUserFavoriteMovie={movies => setUserFavoriteMovie(movies)}
        />
      ))}
    </div>
  );
}

export default connect(mapStateToProps)(MoviesList);

MoviesList.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      Title: PropTypes.string,
      ImageUrl: PropTypes.string,
      Description: PropTypes.string,
      Genre: PropTypes.exact({
        _id: PropTypes.string,
        Name: PropTypes.string,
        Description: PropTypes.string
      }),
      Director: PropTypes.shape({
        Name: PropTypes.string
      })
    })
  )
};
