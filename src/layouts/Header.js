import React from "react";
import { Link } from "react-router-dom";

import sharedStyles from "../styles/shared.module.scss";

const Header = props => {
  const { userLoggedIn, onLogout } = props;
  return (
    <div className={sharedStyles.headerWrapper}>
      <div>
        <h4>Drawing app</h4>
        <Link to="/rooms">Go to rooms</Link>
      </div>
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
