import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";

import { useImmer } from "use-immer";
import RoomMemberList from "../components/RoomMemberList";
import Canvas from "../components/Canvas";

import axios from "axios";
import ChatBox from "../components/ChatBox";

import roomStyles from "../styles/rooms.module.scss";
import ButtonWithSpinner from "../components/ButtonWithSpinner";
import DrawingDashboard from "../components/DrawingDashboard";
const io = require("socket.io-client");

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

const useRoom = (userLoggedIn, roomID) => {
  const [members, setMembers] = useImmer([]);
  const [chats, setChats] = useImmer([]);
  const [room, setRoom] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [roundStatus, setRoundStatus] = useState("WAITING");
  const [userDrawing, setUserDrawing] = useState(null);
  const [word, setWord] = useState(null);
  const [correctWord, setCorrectWord] = useState(null);
  const [nextUserDrawing, setNextUserDrawing] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);

  const [collectData, setCollectData] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [coordinatesToDraw, setCoordinatesToDraw] = useState([]);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io("http://localhost:3000/room?roomID=" + roomID);
    setSocket(socketConnection);
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

    console.log(socket.connected);
    const initSocket = () => {
      socket.on("connect", () => {
        console.log("Connected");
        socket
          .on("authenticated", tesr => {
            console.log("AUTHENTICATED");
            socket.on("members", data => {
              console.log("SET");
              console.log(data);
              setMembers(members => data);
            });

            socket.on("userLeft", data => {
              const { userID } = data;

              setMembers(members => {
                const membersIndex = members.findIndex(
                  user => userID === user.id
                );

                console.log("LEFT");
                console.log(members[membersIndex]);

                if (membersIndex >= 0) {
                  members.splice(membersIndex, 1);
                }
              });
            });

            socket.on("roundStarted", ({ word, userDrawing }) => {
              setRoundStatus("STARTED");
              setIsDrawing(userLoggedIn.id === userDrawing.id);
              setWord(word);
              setUserDrawing(userDrawing);
            });

            socket.on("roundEnded", ({ userGuessed, correctWord, points }) => {
              setRoundStatus("NEXT_ROUND");
              setRoundWinner(userGuessed);
              setIsDrawing(false);
              setWord(null);
              setCorrectWord(correctWord);
            });

            socket.on("gameEnded", () => {
              setRoundStatus("GAME_OVER");
            });

            socket.on("chat", chatInfo => {
              const { user, message, type } = chatInfo;

              setChats(chats => {
                chats.push({ user, message, type });
              });
            });

            socket.on("userJoined", data => {
              const { user } = data;
              console.log("JOINED");
              console.log(user);
              setMembers(members => {
                members.push(user);
              });
            });

            socket.on("draw", data => {
              setCoordinatesToDraw(c => [...c, ...data]);
            });

            socket.on("gameStarted_error", data => {
              alert("Game started error: " + data.error);
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
              socket.removeListener("members");
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
      console.log(x, y);
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
    nextUserDrawing
  ];
};

const Room = props => {
  const { userLoggedIn } = props;
  let { id: roomID } = useParams();

  console.log(roomID);
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
    nextUserDrawing
  ] = useRoom(userLoggedIn, roomID);

  return (
    room && (
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
              {userLoggedIn.id == room.author_id && (
                <ButtonWithSpinner
                  text={"Start game"}
                  loadingText={"Loading"}
                  onSubmit={onStartGame}
                  isDisabled={members.length < 2}
                ></ButtonWithSpinner>
              )}
            </div>
            <b>Members:</b>
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
    )
  );
};

export default Room;
