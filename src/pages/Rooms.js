import React, { useEffect } from "react";
import axios from "axios";
import RoomList from "../components/RoomList";
import { useHistory } from "react-router-dom";
import CreateNewRoom from "../components/CreateNewRoom";

import roomStyles from "../styles/rooms.module.scss";

import useSocket from "use-socket.io-client";
import { useImmer } from "use-immer";

const useRooms = () => {
  const [rooms, setRooms] = useImmer([]);

  const [socket] = useSocket("http://localhost:3000/rooms", {
    autoConnect: true
  });

  useEffect(() => {
    socket.on("connect", () => {
      socket
        .on("authenticated", () => {
          socket.on("rooms", data => {
            setRooms(rooms => data);
          });

          socket.on("newRoom", data => {
            setRooms(rooms => {
              rooms.unshift(data);
            });
          });

          socket.on("userLeft", data => {
            const { roomID, userID } = data;

            console.log("USER LEFT", roomID, userID);
            setRooms(rooms => {
              const roomIndex = rooms.findIndex(room => room.id === roomID);
              if (roomIndex >= 0) {
                rooms[roomIndex].users = rooms[roomIndex].users.filter(
                  user => userID !== user.id
                );
                console.log(rooms[roomIndex]);
              }
            });
          });

          socket.on("userJoined", data => {
            const { roomID, user } = data;
            setRooms(rooms => {
              const roomIndex = rooms.findIndex(room => room.id === roomID);
              if (roomIndex >= 0) {
                rooms[roomIndex].users.push(user);
              }
            });
          });
        })
        .emit("authenticate", { token: localStorage.getItem("authToken") });
    });

    return function cleanup() {
      socket.disconnect();
    };
  }, [setRooms, socket]);

  return [rooms];
};

const Rooms = () => {
  let history = useHistory();
  const [rooms] = useRooms();

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

  const joinARoom = async roomID => {
    try {
      const createNewRoomResponse = await axios.post(`rooms/join/` + roomID);

      if (createNewRoomResponse.data.joined === true) {
        history.push("/room/" + roomID);
      }
    } catch (e) {}
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
        ></RoomList>
      )}
    </React.Fragment>
  );
};

export default Rooms;
