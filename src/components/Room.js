import React from "react";

import ButtonWithSpinner from "./ButtonWithSpinner";

import roomStyles from "../styles/rooms.module.scss";
import RoomMemberList from "./RoomMemberList";
import UserLink from "./UserLink";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Room = props => {
  const { room, onJoin, onDelete, deletable = false } = props;

  let roundStatusText = null;
  if (room.status) {
    switch (room.status) {
      case "NOT_STARTED":
        roundStatusText = "Not started yet";
        break;
      case "WAITING_ROUND":
        roundStatusText = "Waiting for next round";
        break;
      case "ROUND_IN_PROGRESS":
        roundStatusText = "Guessing in progress";
        break;
      case "GAME_OVER":
        roundStatusText = "Game has ended";
        break;
    }
  } else {
    roundStatusText = "Not started yet";
  }

  const isFull = room.members.length === 8;

  return (
    <div className={roomStyles.roomWrapper}>
      <div>
        <div className={roomStyles.roomHeaderWrapper}>
          <h6 className={roomStyles.roomTitle}>{room.name}</h6>
          {deletable && (
            <FontAwesomeIcon
              className={roomStyles.removeRoomButton}
              icon={faTimes}
              onClick={() => onDelete && onDelete(room.id)}
            />
          )}
        </div>
        <i>{roundStatusText}</i>
        <p>
          Owner:{" "}
          <UserLink
            username={room.author.username}
            id={room.author.id}
          ></UserLink>
        </p>

        <RoomMemberList
          userDrawingID={room.userDrawing ? room.userDrawing.id : null}
          authorID={room.author.id}
          members={room.members}
        ></RoomMemberList>
      </div>
      <ButtonWithSpinner
        isDisabled={isFull}
        text={"Join room" + (isFull ? " (full)" : "")}
        loadingText="Loading..."
        isLoading={false}
        onSubmit={() => onJoin && onJoin(room.id)}
      ></ButtonWithSpinner>
    </div>
  );
};

export default Room;
