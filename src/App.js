import React, { useState, useCallback, useEffect } from "react";
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

const App = () => {
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
    <React.Fragment>
      <Route path="/login">
        <Login onLogin={login} />
      </Route>
      <Route path="/register">
        <Register onRegister={login} />
      </Route>
    </React.Fragment>
  );

  const loggedInRoutes = (
    <>
      <Header userLoggedIn={userLoggedIn} onLogout={logout}></Header>
      <Route path="/rooms">
        <Rooms userLoggedIn={userLoggedIn} />
      </Route>
      <Route path="/room/:id">
        <Room userLoggedIn={userLoggedIn} />
      </Route>
    </>
  );

  return (
    <Router>
      <div>
        <Switch>
          {!isLoading ? (
            isLoggedIn && userLoggedIn ? (
              loggedInRoutes
            ) : (
              loggedOutRoutes
            )
          ) : (
            <></>
          )}
        </Switch>
      </div>
    </Router>
  );
};

export default App;
