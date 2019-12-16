import React from "react";
import sharedStyles from "../styles/shared.module.scss";

const Header = props => {
  const { userLoggedIn, onLogout } = props;
  return (
    <div className={sharedStyles.headerWrapper}>
      <h4>Drawing app</h4>
      <div className={sharedStyles.userInfoWrapper}>
        <p>Logged in as {userLoggedIn.username}</p>
        <p className={sharedStyles.logout} onClick={onLogout}>
          Logout
        </p>
      </div>
    </div>
  );
};

export default Header;
