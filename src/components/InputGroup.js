import React from "react";
import sharedStyles from "../styles/shared.module.scss";

const InputGroup = props => {
  const {
    label,
    type,
    onChange,
    placeholder,
    isError,
    onEnterPress,
    value
  } = props;

  return (
    <div className={sharedStyles.inputGroup}>
      <label>{label}</label>
      <input
        className={isError ? sharedStyles.inputError : ""}
        type={type || "text"}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();

            onEnterPress && onEnterPress();
          }
        }}
        value={value}
      />
    </div>
  );
};

export default InputGroup;
