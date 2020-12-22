import React from "react";
import axios from "axios";
import {
  Button,
  Form,
  FormControl,
  Navbar,
  Nav,
  NavDropdown,
  Row,
  Col
} from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
// #0
import {
  setMovies,
  setUserProfile,
  setUserFavoriteMovie,
  setLoggedInUser
} from "../../actions/actions";

import MoviesList from "../movie-list/movie-list";
import "./main-view.scss";
import { LoginView } from "../login-view/login-view";
import { RegisterView } from "../reg-view/reg-view";
import { GenreView } from "../genre-view/genre-view";
import { DirectorView } from "../director-view/director-view";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";
import { ProfileView } from "../profile-view/profile-view";
import { UpdateUserView } from "../updateuser-view/updateuser-view";
import { AboutView } from "../about-view/about-view";
import { ContactView } from "../contact-view/contact-view";

export class MainView extends React.Component {
  constructor() {
    super();
    this.state = {
      movies: [],
      user: null,
      userProfile: null,
      favoriteMovies: null
    };
  }

  getMovies(token) {
    axios
      .get("https://scarpantonioapi.herokuapp.com/movies", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        // we pass this function from actions.jsx to give that action type the value of the api call.
        this.props.setMovies(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  getUser(token) {
    const username = localStorage.getItem("user");
    axios
      .get(`https://scarpantonioapi.herokuapp.com/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        this.props.setUserProfile(response.data);
      })
      .catch(function(err) {
        console.log("unable to get user data" + err);
      });
  }

  getFavMovies(token) {
    const username = localStorage.getItem("user");
    axios
      .get(`https://scarpantonioapi.herokuapp.com/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        this.props.setUserFavoriteMovie(response.data.FavoriteMovies);
      })
      .catch(function(err) {
        console.log("unable to get user data" + err);
      });
  }

  componentDidMount() {
    let accessToken = localStorage.getItem("token");
    if (accessToken !== null) {
      this.setState({
        user: localStorage.getItem("user")
      });
      this.getMovies(accessToken);
      this.getUser(accessToken);
      this.getFavMovies(accessToken);
    }
  }
  onLoggedIn(authData) {
    this.setState({
      user: this.props.setLoggedInUser(authData.user.Username)
    });
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", authData.user.Username);
    // we get the token here to pass it to the functions that retrieve the data we need for the other pages.
    this.getMovies(authData.token);
    this.getUser(authData.token);
    getFavMovies(authData.token);
  }

  onLoggedOut() {
    alert("You have been logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.setState({
      user: null
    });
    window.open("/", "_self");
  }

  updateUser(token) {
    const username = localStorage.getItem("user");
    axios
      .delete(`https://scarpantonioapi.herokuapp.com/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        console.log(res);
        console.log("user deleted");
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  render() {
    // #2
    let {
      movies,
      userProfile,
      favoriteMovies,
      setUserFavoriteMovie
    } = this.props;
    // seguimos almacenando estas dos en un state local talvez es parte del problema
    let { user, addFavMovBtn } = this.state;

    if (!movies) return <div className="main-view" />;

    return (
      <Router basename="/client">
        <div className="fixed-top">
          <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Brand as={Link} to="/">
              FLIX
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link as={Link} to="/">
                  {!user ? null : "Home"}
                </Nav.Link>

                <Nav.Link as={Link} to="/profile">
                  {!user ? null : "Profile"}
                </Nav.Link>

                <Nav.Link
                  className="loggout"
                  onClick={() => this.onLoggedOut()}
                  to="/"
                >
                  {!user ? null : <b>Log Out</b>}
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>

        <div className="main-view">
          <Route
            exact
            path="/"
            render={() => {
              if (!user)
                return <LoginView onLoggedIn={user => this.onLoggedIn(user)} />;
              return (
                // is always false because we are not looping in the movies
                <MoviesList
                  key={movies._id}
                  movies={movies}
                  favoriteMovies={favoriteMovies}
                  setUserFavoriteMovie={setUserFavoriteMovie}
                />
              );
              // return <MovieCard movies={movies} />;
              if (!favoriteMovies) {
                return null;
              }
            }}
          />
          <Route path="/register" render={() => <RegisterView />} />
          <Route
            path="/movies/:movieId"
            render={({ match }) => (
              <MovieView
                movie={movies.find(m => m._id === match.params.movieId)}
              />
            )}
          />
          <Route
            path="/directors/:name"
            render={({ match }) => {
              if (!movies) return <div className="main-view" />;
              return (
                <DirectorView
                  director={
                    movies.find(m => m.Director.Name === match.params.name)
                      .Director
                  }
                />
              );
            }}
          />
          <Route
            path="/genres/:name"
            render={({ match }) => {
              if (!movies) return <div className="main-view" />;
              return (
                <GenreView
                  genre={
                    movies.find(m => m.Genre.Name === match.params.name).Genre
                  }
                />
              );
            }}
          />
          <Route
            exact
            path="/profile"
            render={() => (
              <ProfileView
                movies={movies}
                userProfile={userProfile}
                favoriteMovies={favoriteMovies}
              />
            )}
          />

          <Route
            exact
            path="/profile/update"
            render={() => (
              <UpdateUserView
                userProfile={userProfile}
                onLoggedIn={user => this.onLoggedIn(user)}
              />
            )}
          />
        </div>
      </Router>
    );
  }
}

// #3
let mapStateToProps = state => {
  return {
    movies: state.movies,
    userProfile: state.userProfile,
    user: state.userLoogedIn,
    favoriteMovies: state.userFavoriteMovies
  };
};

export default connect(mapStateToProps, {
  setMovies,
  setUserProfile,
  setUserFavoriteMovie,
  setLoggedInUser
})(MainView);

MainView.propTypes = {
  setMovies: PropTypes.func.isRequired,
  setUserProfile: PropTypes.func.isRequired,
  setUserFavoriteMovie: PropTypes.func.isRequired,
  setLoggedInUser: PropTypes.func.isRequired
};
