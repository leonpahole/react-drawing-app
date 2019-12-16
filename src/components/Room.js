import React from "react";

import ButtonWithSpinner from "./ButtonWithSpinner";

import roomStyles from "../styles/rooms.module.scss";
import RoomMemberList from "./RoomMemberList";

const Room = props => {
  const { room, onJoin } = props;

  return (
    <div className={roomStyles.roomWrapper}>
      <div>
        <p>{room.name}</p>
        <p>Owner: {room.author.username}</p>

        <RoomMemberList members={room.users}></RoomMemberList>
      </div>
      <ButtonWithSpinner
        text="Join room"
        loadingText="Loading..."
        isLoading={false}
        onSubmit={() => onJoin && onJoin(room.id)}
      ></ButtonWithSpinner>
    </div>
  );
};

export default Room;
