import React from "react";

const RoomMemberList = props => {
  const { members, authorID, userDrawingID } = props;

  return (
    <div>
      {members.map(member => (
        <p key={member.id}>
          {member.username}, points: {member.points}{" "}
          {member.id === userDrawingID && <i>Currently drawing</i>}
          {member.id === authorID && <span>(owner)</span>}
        </p>
      ))}
    </div>
  );
};

export default RoomMemberList;
