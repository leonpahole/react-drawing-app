import React, { useCallback, useState } from "react";
import LoginRegisterForm from "../components/LoginRegisterForm";

import loginRegisterStyles from "../styles/loginRegister.module.scss";
import axios from "axios";

const useRegister = (onRegister, displayError) => {
  const [performRegisterError, setPerformRegisterError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const performRegister = useCallback(
    async ({ username, password }) => {
      setIsRegistering(true);
      try {
        const registerResponse = await axios.post(`users/register`, {
          username,
          password
        });

        if (
          registerResponse.data == null ||
          registerResponse.data.error === true ||
          registerResponse.data.token == null
        ) {
          displayError("Register failed: " + registerResponse.data.message);
          setIsRegistering(false);
        } else {
          localStorage.setItem("authToken", registerResponse.data.token);
          onRegister && onRegister(true);
        }
      } catch (e) {
        displayError("A network error has occured. Please try again later.");
        setIsRegistering(false);
      }
    },
    [onRegister]
  );

  return [performRegister, performRegisterError, isRegistering];
};

const Register = props => {
  const { onRegister, displayError } = props;
  const [performRegister, performRegisterError, isRegistering] = useRegister(
    onRegister,
    displayError
  );
  return (
    <div className={loginRegisterStyles.formWrapper}>
      <LoginRegisterForm
        onSubmitForm={performRegister}
        isRegister={true}
        errorMessage={performRegisterError}
        isSubmitting={isRegistering}
      ></LoginRegisterForm>
    </div>
  );
};

export default Register;
