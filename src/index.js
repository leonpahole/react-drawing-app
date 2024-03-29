import React from "react";
import ReactDOM from "react-dom";
import "./styles/global.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import { SnackbarProvider } from "react-snackbar-alert";

axios.defaults.baseURL = "http://localhost:3000";

ReactDOM.render(
  <SnackbarProvider timeout={10000}>
    <App />
  </SnackbarProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
