import React from "react";
import { Link } from "react-router-dom";

const UserLink = ({ username, id }) => {
  return (
    <Link target="_blank" to={`/profile/${id}`}>
      {username}
    </Link>
  );
};

export default UserLink;
