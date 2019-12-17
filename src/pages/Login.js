import React, { useCallback, useState } from "react";
import LoginRegisterForm from "../components/LoginRegisterForm";

import loginRegisterStyles from "../styles/loginRegister.module.scss";
import axios from "axios";

const useLogin = (onLogin, displayError) => {
  const [performLoginError, setPerformLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const performLogin = useCallback(
    async ({ username, password }) => {
      setIsLoggingIn(true);
      try {
        const loginResponse = await axios.post(`users/login`, {
          username,
          password
        });

        if (
          loginResponse.data == null ||
          loginResponse.data.error === true ||
          loginResponse.data.token == null
        ) {
          displayError("Username or password incorrect.");
          setIsLoggingIn(false);
        } else {
          localStorage.setItem("authToken", loginResponse.data.token);
          onLogin && onLogin(true);
        }
      } catch (e) {
        displayError("A network error has occured. Please try again later.");
        setIsLoggingIn(false);
      }
    },
    [onLogin]
  );

  return [performLogin, performLoginError, isLoggingIn];
};

const Login = props => {
  const { onLogin, displayError } = props;
  const [performLogin, performLoginError, isLoggingIn] = useLogin(
    onLogin,
    displayError
  );

  return (
    <div className={loginRegisterStyles.formWrapper}>
      <LoginRegisterForm
        onSubmitForm={performLogin}
        isRegister={false}
        errorMessage={performLoginError}
        isSubmitting={isLoggingIn}
      ></LoginRegisterForm>
    </div>
  );
};

export default Login;
