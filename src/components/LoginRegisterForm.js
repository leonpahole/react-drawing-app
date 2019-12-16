import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";

import loginRegisterStyles from "../styles/loginRegister.module.scss";
import sharedStyles from "../styles/shared.module.scss";
import ButtonWithSpinner from "./ButtonWithSpinner";
import InputGroup from "./InputGroup";

const useLoginRegister = onSubmitForm => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [emptyInputsError, setEmptyInputsError] = useState(false);

  const onSubmit = useCallback(() => {
    let inputMissingError = false;

    if (username.length === 0 || password.length === 0) {
      inputMissingError = true;

      if (emptyInputsError === false) {
        setEmptyInputsError(true);
      }
    } else if (emptyInputsError === true) {
      setEmptyInputsError(false);
    }

    if (inputMissingError === false) {
      onSubmitForm && onSubmitForm({ username, password });
    }
  }, [onSubmitForm, username, password, emptyInputsError]);

  return [setUsername, setPassword, onSubmit, emptyInputsError];
};

const LoginRegisterForm = props => {
  const { isRegister, onSubmitForm, errorMessage, isSubmitting } = props;

  const [
    setUsername,
    setPassword,
    onSubmit,
    emptyInputsError
  ] = useLoginRegister(onSubmitForm);

  return (
    <div className={loginRegisterStyles.form}>
      <h3 className={loginRegisterStyles.title}>
        {isRegister ? "Create an account" : "Login"}{" "}
      </h3>
      <InputGroup
        label="Username"
        placeholder="Enter your username..."
        onChange={e => setUsername(e.target.value)}
        onEnterPress={onSubmit}
      ></InputGroup>

      <InputGroup
        label="Password"
        type="password"
        placeholder="Enter your password..."
        onChange={e => setPassword(e.target.value)}
        onEnterPress={onSubmit}
      ></InputGroup>

      <ButtonWithSpinner
        text={isRegister ? "Register" : "Login"}
        loadingText={"Loading..."}
        isLoading={isSubmitting}
        onSubmit={onSubmit}
      ></ButtonWithSpinner>

      <div className={sharedStyles.errorWrapper}>
        {emptyInputsError ? "Enter all requried fields" : errorMessage}
      </div>

      <div className={loginRegisterStyles.noticeWrap}>
        {isRegister ? (
          <Link to="/login">Log in to existing account</Link>
        ) : (
          <Link to="/register">Create an account</Link>
        )}
      </div>
    </div>
  );
};

export default LoginRegisterForm;
