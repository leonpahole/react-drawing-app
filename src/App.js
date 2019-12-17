import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";
import Header from "./layouts/Header";

import axios from "axios";
import Profile from "./pages/Profile";

import { wrapComponent } from "react-snackbar-alert";

const App = wrapComponent(({ createSnackbar }) => {
  const displayError = message => {
    createSnackbar({
      message,
      theme: "error"
    });
  };

  const displaySuccess = message => {
    createSnackbar({
      message,
      theme: "success"
    });
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    login();
  });

  const login = useCallback(() => {
    if (isLoggedIn === false && localStorage.getItem("authToken") != null) {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("authToken");
      setIsLoggedIn(true);
      setIsLoading(true);
    }
  }, [isLoggedIn]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    axios.defaults.headers.common["Authorization"] = null;
    localStorage.removeItem("authToken");
    return <Redirect from="/" to="login"></Redirect>;
  }, []);

  useEffect(() => {
    const getUserDetails = async () => {
      if (isLoggedIn) {
        setIsLoading(true);
        try {
          const userResponse = await axios.get(`/users/me`);
          setUserLoggedIn(userResponse.data.user);
          setIsLoading(false);
        } catch (e) {
          logout();
        }
      } else {
        setIsLoading(false);
      }
    };

    getUserDetails();
  }, [isLoggedIn, setUserLoggedIn, setIsLoading, logout]);

  const loggedOutRoutes = (
    <Switch>
      <Route path="/login">
        <Login
          displayError={displayError}
          displaySuccess={displaySuccess}
          onLogin={login}
        />
      </Route>
      <Route path="/register">
        <Register
          displayError={displayError}
          displaySuccess={displaySuccess}
          onRegister={login}
        />
      </Route>
      <Redirect exact from="/rooms" to="/login"></Redirect>
      <Redirect exact from="/room" to="/login"></Redirect>
      <Redirect exact from="/profile" to="/login"></Redirect>
      <Redirect exact from="/" to="/login"></Redirect>
    </Switch>
  );

  const loggedInRoutes = (
    <>
      <Header userLoggedIn={userLoggedIn} onLogout={logout}></Header>
      <Switch>
        <Route path="/rooms">
          <Rooms
            displayError={displayError}
            displaySuccess={displaySuccess}
            userLoggedIn={userLoggedIn}
          />
        </Route>
        <Route path="/room/:id">
          <Room
            displayError={displayError}
            displaySuccess={displaySuccess}
            userLoggedIn={userLoggedIn}
          />
        </Route>
        <Route path="/profile/:id">
          <Profile
            displayError={displayError}
            displaySuccess={displaySuccess}
          ></Profile>
        </Route>
        <Redirect exact from="/login" to="/rooms"></Redirect>
        <Redirect exact from="/register" to="/rooms"></Redirect>
        <Redirect exact from="/" to="/rooms"></Redirect>
      </Switch>
    </>
  );

  return (
    <Router>
      <div>
        {!isLoading ? (
          isLoggedIn && userLoggedIn ? (
            loggedInRoutes
          ) : (
            loggedOutRoutes
          )
        ) : (
          <></>
        )}
      </div>
    </Router>
  );
});

export default App;
