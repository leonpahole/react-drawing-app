import React from "react";

import roomStyles from "../styles/rooms.module.scss";
import UserLink from "./UserLink";

const RoomMemberList = props => {
  const { members, authorID, userDrawingID } = props;

  return members && members.length > 0 ? (
    <>
      <b>Members</b>
      <div className={roomStyles.roomMemberListWrapper}>
        {members.map(member => (
          <p key={member.id}>
            <UserLink username={member.username} id={member.id}></UserLink>,
            points: {member.points}{" "}
            {member.id === userDrawingID && <i>Currently drawing</i>}
            {member.id === authorID && <span>(owner)</span>}
          </p>
        ))}
      </div>
    </>
  ) : null;
};

export default RoomMemberList;
