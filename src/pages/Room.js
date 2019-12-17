import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";

import { useImmer } from "use-immer";
import RoomMemberList from "../components/RoomMemberList";
import Canvas from "../components/Canvas";

import axios from "axios";
import ChatBox from "../components/ChatBox";

import roomStyles from "../styles/rooms.module.scss";
import sharedStyles from "../styles/shared.module.scss";
import ButtonWithSpinner from "../components/ButtonWithSpinner";
import DrawingDashboard from "../components/DrawingDashboard";
import winFile from "../assets/win.mp3";
import plingFile from "../assets/pling.mp3";
import roundStartFile from "../assets/roundStart.mp3";
import tickFile from "../assets/tick.mp3";
const io = require("socket.io-client");

const tickAudio = new Audio(tickFile);
const plingAudio = new Audio(plingFile);
const roundStartAudio = new Audio(roundStartFile);
const winAudio = new Audio(winFile);

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const useRoom = (userLoggedIn, roomID, displayError) => {
  const [members, setMembers] = useImmer([]);
  const [chats, setChats] = useImmer([]);
  const [room, setRoom] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [roundStatus, setRoundStatus] = useState("NOT_STARTED");
  const [userDrawing, setUserDrawing] = useState(null);
  const [word, setWord] = useState(null);
  const [correctWord, setCorrectWord] = useState(null);
  const [nextUserDrawing, setNextUserDrawing] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);

  const [collectData, setCollectData] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [coordinatesToDraw, setCoordinatesToDraw] = useState([]);

  const [socket, setSocket] = useState(null);
  const winDivRef = useRef();

  const animateWin = () => {
    const elem = winDivRef.current;
    let opa = 0;
    let opaIncrement = 0.1;
    let count = 0;
    elem.style.display = "flex";
    const animateInterval = setInterval(frame, 60);
    function frame() {
      if (opa < 0 || opa > 1) {
        if (count === 5) {
          elem.style.display = "none";
          clearInterval(animateInterval);
        } else {
          winAudio.play();
          opaIncrement = -opaIncrement;
          opa = opaIncrement < 0 ? 1 : 0;
          count++;
        }
      } else {
        opa += opaIncrement;
        elem.style.opacity = opa;
      }
    }
  };

  useInterval(
    () => {
      tickAudio.play();
    },
    roundStatus === "ROUND_IN_PROGRESS" ? 2000 : null
  );

  useEffect(() => {
    const socketConnection = io("http://localhost:3000/room?roomID=" + roomID);
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    let didCancel = false;

    const getJoinedRoom = async () => {
      try {
        const roomResponse = await axios.get(`/rooms/` + roomID);
        if (!didCancel) {
          setRoom(roomResponse.data.room);
        }
      } catch (e) {}
    };

    getJoinedRoom();

    return () => {
      didCancel = true;
    };
  }, [setRoom, userLoggedIn, roomID]);

  useEffect(() => {
    if (!userLoggedIn) return;
    if (!socket) return;
    if (socket.connected) return;

    const initSocket = () => {
      socket.on("connect", () => {
        socket
          .on("authenticated", () => {
            socket.on(
              "room",
              ({ members, status, userDrawing, wordDrawing }) => {
                setMembers(m => members);
                setRoundStatus(status);
                setUserDrawing(userDrawing);
                setIsDrawing(userDrawing && userLoggedIn.id === userDrawing.id);
                setWord(wordDrawing);
              }
            );

            socket.on("userLeft", data => {
              const { userID } = data;

              setMembers(members => {
                const membersIndex = members.findIndex(
                  user => userID === user.id
                );

                if (membersIndex >= 0) {
                  members.splice(membersIndex, 1);
                }
              });
            });

            socket.on("roundStarted", ({ word, userDrawing }) => {
              roundStartAudio.play();
              setRoundStatus("ROUND_IN_PROGRESS");
              setIsDrawing(userLoggedIn.id === userDrawing.id);
              setWord(word);
              setUserDrawing(userDrawing);
            });

            socket.on("roundWaiting", () => {
              setRoundStatus("WAITING_ROUND");
            });

            socket.on(
              "roundEnded",
              ({
                userGuessed,
                userDrawing,
                correctWord,
                receivedPoints,
                receivedPointsForDrawingUser
              }) => {
                if (userGuessed) {
                  setMembers(members => {
                    const winnerIndex = members.findIndex(
                      user => userGuessed.id === user.id
                    );

                    if (userGuessed.id === userLoggedIn.id) {
                      animateWin();
                    }
                    members[winnerIndex].points += receivedPoints;

                    const drawingUserIndex = members.findIndex(
                      user => userDrawing.id === user.id
                    );

                    members[
                      drawingUserIndex
                    ].points += receivedPointsForDrawingUser;
                  });
                }
                setUserDrawing(null);
                setRoundStatus("WAITING_ROUND");
                setRoundWinner(userGuessed);
                setIsDrawing(false);
                setWord(null);
                setCorrectWord(correctWord);
              }
            );

            socket.on("gameEnded", () => {
              setRoundStatus("GAME_OVER");
            });

            socket.on("chat", chatInfo => {
              const { user, message, type } = chatInfo;

              if (
                type !== "system" &&
                user != null &&
                userLoggedIn.id != user.id
              ) {
                plingAudio.play();
              }
              setChats(chats => {
                chats.push({ user, message, type });
              });
            });

            socket.on("userJoined", data => {
              const { user } = data;

              setMembers(members => {
                members.push(user);
              });
            });

            socket.on("draw", data => {
              setCoordinatesToDraw(c => [...c, ...data]);
            });

            socket.on("gameStarted_error", data => {
              displayError(`Error: ${data.error}`);
            });

            socket.on("disconnect", () => {
              socket.removeListener("authenticated");
              socket.removeListener("chat");
              socket.removeListener("gameStarted_error");
              socket.removeListener("draw");
              socket.removeListener("userJoined");
              socket.removeListener("roundEnded");
              socket.removeListener("roundStarted");
              socket.removeListener("userLeft");
              socket.removeListener("room");
              socket.removeListener("gameEnded");
            });
          })
          .emit("authenticate", { token: localStorage.getItem("authToken") });
      });
    };

    initSocket();
  }, [setChats, setMembers, setCoordinatesToDraw, socket, userLoggedIn]);

  const sendChatMessage = useCallback(
    message => {
      if (!socket) return;

      socket.emit("chat", { message });
    },
    [socket]
  );

  const onDraw = useCallback(
    ({ x, y }) => {
      setCoordinates(c => [...c, { x, y }]);

      setCollectData(true);
    },
    [setCollectData, setCoordinates]
  );

  useInterval(
    () => {
      if (coordinates.length === 0) {
        setCollectData(false);
      } else {
        socket.emit("draw", coordinates);
        setCoordinates([]);
      }
    },
    collectData ? 100 : null
  );

  const onStartGame = async () => {
    try {
      socket.emit(`startGame`);
    } catch (e) {}
  };

  return [
    room,
    members,
    chats,
    sendChatMessage,
    onDraw,
    coordinatesToDraw,
    onStartGame,
    isDrawing,
    roundStatus,
    userDrawing,
    word,
    correctWord,
    roundWinner,
    nextUserDrawing,
    winDivRef
  ];
};

const Room = props => {
  const { userLoggedIn, displayError } = props;
  let { id: roomID } = useParams();

  const [
    room,
    members,
    chats,
    sendChatMessage,
    onDraw,
    coordinatesToDraw,
    onStartGame,
    isDrawing,
    roundStatus,
    userDrawing,
    word,
    correctWord,
    roundWinner,
    nextUserDrawing,
    winDivRef
  ] = useRoom(userLoggedIn, roomID, displayError);

  return (
    <>
      <div ref={winDivRef} className={sharedStyles.winWrapper}>
        <h6>You have won the round!</h6>
      </div>
      {room && (
        <div className={roomStyles.entireRoomWrapper}>
          <div className={roomStyles.singeRoomWrapper}>
            <div className={roomStyles.canvasWrapper}>
              <Canvas
                onDraw={onDraw}
                isDrawingAllowed={isDrawing}
                coordinates={coordinatesToDraw}
                currentWord={word}
                userCurrentlyDrawing={userDrawing}
              ></Canvas>
              <DrawingDashboard
                isDrawing={isDrawing}
                userDrawing={userDrawing ? userDrawing.username : ""}
                roundStatus={roundStatus}
                word={word}
                nextUser={nextUserDrawing}
                winnerOfRound={roundWinner}
                correctWord={correctWord}
                winnerOfGame={null}
              ></DrawingDashboard>
            </div>
            <div className={roomStyles.roomInfoWrapper}>
              <div className={roomStyles.controlPanelWrapper}>
                {userLoggedIn.id == room.author_id &&
                  (roundStatus === "GAME_OVER" ||
                    roundStatus === "NOT_STARTED") && (
                    <ButtonWithSpinner
                      text={"Start game"}
                      loadingText={"Loading"}
                      onSubmit={onStartGame}
                      isDisabled={members.length < 2}
                    ></ButtonWithSpinner>
                  )}
              </div>
              <div className={roomStyles.roomInfoDetailsWrapper}>
                <RoomMemberList
                  userDrawingID={userDrawing ? userDrawing.id : null}
                  authorID={room.author_id}
                  members={members}
                ></RoomMemberList>
              </div>
              <ChatBox
                loggedInUserID={userLoggedIn.id}
                chats={chats}
                sendChatMessage={sendChatMessage}
              ></ChatBox>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Room;
