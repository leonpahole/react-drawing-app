import React from "react";
import Room from "./Room";

import roomStyles from "../styles/rooms.module.scss";

const RoomList = props => {
  const { rooms, onJoin, onDelete, loggedInUserID } = props;

  return (
    <div className={roomStyles.roomList}>
      {rooms && rooms.length > 0 ? (
        <>
          {rooms.map(room => (
            <Room
              deletable={loggedInUserID === room.author.id}
              onDelete={onDelete}
              authorID={room.author.id}
              onJoin={onJoin}
              key={room.id}
              room={room}
            ></Room>
          ))}
        </>
      ) : (
        <p>No Rooms yet.</p>
      )}
    </div>
  );
};

export default RoomList;
