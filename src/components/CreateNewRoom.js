import React, { useState } from "react";
import InputGroup from "./InputGroup";
import ButtonWithSpinner from "./ButtonWithSpinner";

import roomStyles from "../styles/rooms.module.scss";

const CreateNewRoom = props => {
  const { onCreate } = props;

  const [roomName, setRoomName] = useState("");

  return (
    <div className={roomStyles.createNewRoomForm}>
      <div>
        <h5>Create a new room</h5>
        <InputGroup
          label="Room name"
          placeholder="Enter a room name"
          onChange={e => setRoomName(e.target.value)}
        ></InputGroup>
      </div>
      <ButtonWithSpinner
        text="Create and join a room"
        loadingText="Loading..."
        isLoading={false}
        isDisabled={roomName.length === 0}
        onSubmit={() => onCreate && onCreate(roomName)}
      ></ButtonWithSpinner>
    </div>
  );
};

export default CreateNewRoom;
