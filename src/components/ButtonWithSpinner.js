import React from "react";
import sharedStyles from "../styles/shared.module.scss";
import Spinner from "react-bootstrap/Spinner";

const ButtonWithSpinner = props => {
  const { text, loadingText, isLoading, onSubmit, isDisabled } = props;

  return (
    <button
      className={sharedStyles.submitButton}
      onClick={onSubmit}
      disabled={isDisabled}
    >
      <span>{isLoading ? loadingText || text : text}</span>
      {isLoading && (
        <Spinner
          className={sharedStyles.buttonSpinner}
          as="span"
          size="sm"
          animation="grow"
          role="status"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default ButtonWithSpinner;
