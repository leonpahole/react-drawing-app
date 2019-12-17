import React, { useEffect, useState } from "react";
import axios from "axios";
import RoomList from "../components/RoomList";
import { useHistory } from "react-router-dom";
import CreateNewRoom from "../components/CreateNewRoom";

import roomStyles from "../styles/rooms.module.scss";

import { useImmer } from "use-immer";

const io = require("socket.io-client");

const useRooms = userLoggedIn => {
  const [rooms, setRooms] = useImmer([]);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io("http://localhost:3000/rooms");
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!userLoggedIn) return;
    if (!socket) return;
    if (socket.connected) return;

    const initSocket = () => {
      socket.on("connect", () => {
        socket
          .on("authenticated", () => {
            socket.on("rooms", data => {
              setRooms(rooms => data);
            });

            socket.on("newRoom", ({ room }) => {
              setRooms(rooms => {
                rooms.unshift({
                  id: room.id,
                  name: room.name,
                  author: room.author,
                  status: "NOT_YET_STARTED",
                  members: [],
                  userDrawing: null
                });
              });
            });

            socket.on("roomRemoved", ({ roomID }) => {
              setRooms(rooms => {
                const roomIndex = rooms.findIndex(room => room.id === roomID);
                if (roomIndex >= 0) {
                  rooms.splice(roomIndex, 1);
                }
              });
            });

            socket.on("userLeft", data => {
              const { roomID, userID } = data;

              setRooms(rooms => {
                const roomIndex = rooms.findIndex(room => room.id === roomID);
                if (roomIndex >= 0) {
                  rooms[roomIndex].members = rooms[roomIndex].members.filter(
                    user => userID !== user.id
                  );
                }
              });
            });

            socket.on("userJoined", data => {
              const { roomID, user } = data;

              setRooms(rooms => {
                const roomIndex = rooms.findIndex(room => {
                  return room.id === roomID;
                });
                if (
                  roomIndex >= 0 &&
                  rooms[roomIndex].members.find(u => u.id === user.id) == null
                ) {
                  rooms[roomIndex].members.push(user);
                }
              });
            });

            socket.on("roundStarted", ({ roomID, userDrawing }) => {
              setRooms(rooms => {
                const roomIndex = rooms.findIndex(room => {
                  return room.id === roomID;
                });
                if (roomIndex >= 0) {
                  rooms[roomIndex].status = "ROUND_IN_PROGRESS";
                  rooms[roomIndex].userDrawing = userDrawing;
                }
              });
            });

            socket.on("roundWaiting", ({ roomID }) => {
              setRooms(rooms => {
                const roomIndex = rooms.findIndex(room => {
                  return room.id === roomID;
                });
                if (roomIndex >= 0) {
                  rooms[roomIndex].status = "WAITING_ROUND";
                }
              });
            });

            socket.on(
              "roundEnded",
              ({
                roomID,
                userGuessed,
                userDrawing,
                receivedPoints,
                receivedPointsForDrawingUser
              }) => {
                setRooms(rooms => {
                  if (userGuessed) {
                    const roomIndex = rooms.findIndex(room => {
                      return room.id === roomID;
                    });
                    if (roomIndex >= 0) {
                      rooms[roomIndex].userDrawing = null;
                      rooms[roomIndex].status = "WAITING_ROUND";

                      rooms[roomIndex].members = rooms[roomIndex].members.map(
                        user => {
                          if (userGuessed.id === user.id) {
                            return {
                              ...user,
                              points: user.points + receivedPoints
                            };
                          } else if (userDrawing.id === user.id) {
                            return {
                              ...user,
                              points: user.points + receivedPointsForDrawingUser
                            };
                          }

                          return user;
                        }
                      );
                    }
                  }
                });
              }
            );

            socket.on("gameEnded", ({ roomID }) => {
              setRooms(rooms => {
                const roomIndex = rooms.findIndex(room => {
                  return room.id === roomID;
                });
                if (roomIndex >= 0) {
                  rooms[roomIndex].status = "GAME_OVER";
                }
              });
            });

            socket.on("disconnect", () => {
              socket.removeListener("rooms");
              socket.removeListener("newRoom");
              socket.removeListener("userLeft");
              socket.removeListener("userJoined");
              socket.removeListener("roundStarted");
              socket.removeListener("roomRemoved");
              socket.removeListener("roundEnded");
              socket.removeListener("gameEnded");
              socket.removeListener("roundWaiting");
            });
          })
          .emit("authenticate", { token: localStorage.getItem("authToken") });
      });
    };

    initSocket();
  }, [setRooms, socket, userLoggedIn]);

  return [rooms];
};

const Rooms = ({ userLoggedIn, displayError }) => {
  let history = useHistory();
  const [rooms] = useRooms(userLoggedIn);

  const createNewRoom = async roomName => {
    try {
      const createNewRoomResponse = await axios.post(`rooms`, {
        name: roomName
      });

      if (createNewRoomResponse.data.id != null) {
        history.push("/room/" + createNewRoomResponse.data.id);
      } else {
      }
    } catch (e) {}
  };

  const joinARoom = roomID => {
    history.push("/room/" + roomID);
  };

  const deleteARoom = async roomID => {
    try {
      await axios.delete(`rooms/${roomID}`);
    } catch (e) {
      displayError("Network error has occured.");
    }
  };

  return (
    <React.Fragment>
      <div className={roomStyles.createNewRoomWrapper}>
        <CreateNewRoom onCreate={createNewRoom}></CreateNewRoom>
      </div>
      {rooms && rooms.length > 0 && (
        <RoomList
          onJoin={joinARoom}
          onCreate={createNewRoom}
          rooms={rooms}
          loggedInUserID={userLoggedIn.id}
          onDelete={deleteARoom}
        ></RoomList>
      )}
    </React.Fragment>
  );
};

export default Rooms;
