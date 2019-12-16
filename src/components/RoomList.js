import React from "react";
import Room from "./Room";

import roomStyles from "../styles/rooms.module.scss";

const RoomList = props => {
  const { rooms, onJoin } = props;

  return (
    <div className={roomStyles.roomList}>
      {rooms && rooms.length > 0 ? (
        <>
          {rooms.map(room => (
            <Room onJoin={onJoin} key={room.id} room={room}></Room>
          ))}
        </>
      ) : (
        <p>No Rooms yet.</p>
      )}
    </div>
  );
};

export default RoomList;
