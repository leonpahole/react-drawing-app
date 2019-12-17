import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import profileStyles from "../styles/profile.module.scss";
import axios from "axios";
import moment from "moment";

const useProfile = emitError => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`users/${id}`);

        if (userResponse.data.user) {
          setUser(userResponse.data.user);
        } else {
          emitError("User does not exist.");
        }
      } catch (e) {
        console.log(e);
        emitError("Internal server has occured.");
      }
    };

    fetchUser();
  }, [id]);

  return [user];
};

const Profile = ({ props, displayError }) => {
  const [user] = useProfile(displayError);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className={profileStyles.infoWrapper}>
        <img
          className={profileStyles.avatar}
          src={"https://www.gravatar.com/avatar/" + user.username}
        ></img>
        <div className={profileStyles.basicInfoWrapper}>
          <h4>User: {user.username}</h4>
          <h4>
            Joined: {moment(user.created_at).format("DD. MM. YYYY")} (
            {moment(user.created_at).fromNow()})
          </h4>
        </div>
      </div>
      <div className={profileStyles.detailsWrapper}>
        <p>
          <b>Points collected</b>: {user.points}
        </p>
        <p>
          <b>Games played</b>: {user.games_played}
        </p>
        <p>
          <b>Correctly guessed words</b>: {user.correct_guesses}
        </p>
      </div>
    </>
  );
};

export default Profile;
