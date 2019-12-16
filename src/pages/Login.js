import React, { useCallback, useState } from "react";
import LoginRegisterForm from "../components/LoginRegisterForm";

import loginRegisterStyles from "../styles/loginRegister.module.scss";
import axios from "axios";

const useLogin = onLogin => {
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
          setPerformLoginError(
            "Login failed. Check your username and password."
          );
          setIsLoggingIn(false);
        } else {
          setPerformLoginError(null);
          localStorage.setItem("authToken", loginResponse.data.token);
          onLogin && onLogin(true);
        }
      } catch (e) {
        setPerformLoginError(
          "A network error has occured. Please try again later."
        );
        setIsLoggingIn(false);
      }
    },
    [onLogin]
  );

  return [performLogin, performLoginError, isLoggingIn];
};

const Login = props => {
  const { onLogin } = props;
  const [performLogin, performLoginError, isLoggingIn] = useLogin(onLogin);

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
