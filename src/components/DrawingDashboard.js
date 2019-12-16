import React from "react";
import ButtonWithSpinner from "./ButtonWithSpinner";

import roomStyles from "../styles/rooms.module.scss";

const DrawingDashboard = props => {
  const {
    word = null,
    isDrawing = false,
    userDrawing,
    roundStatus,
    nextUser,
    winnerOfRound,
    winnerOfGame,
    correctWord
  } = props;

  let statusElement = null;

  switch (roundStatus) {
    case "STARTED":
      statusElement = isDrawing ? (
        <span>
          You are drawing: <b>{word}</b>
        </span>
      ) : (
        <span>
          <b>{userDrawing}</b> is drawing.
        </span>
      );
      break;

    case "WAITING":
      statusElement = <span>Waiting for game to start.</span>;
      break;

    case "NEXT_ROUND":
      statusElement = <span>Waiting for next round.</span>;
      break;

    case "GAME_OVER":
      statusElement = <span>Game has ended. </span>;
      break;
  }
  return (
    <div className={roomStyles.drawingDashboardWrapper}>
      <p className={roomStyles.drawingDashboardWord}>{statusElement}</p>
    </div>
  );
};

export default DrawingDashboard;
