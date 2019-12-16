import React, { useState, useEffect, useRef } from "react";

import chatStyles from "../styles/chat.module.scss";
import InputGroup from "./InputGroup";

const ChatBox = props => {
  const { chats, sendChatMessage, loggedInUserID = -1 } = props;
  const [message, setMessage] = useState("");
  const messages = useRef(null);

  useEffect(() => {
    let shouldScroll =
      messages.current.scrollTop + messages.current.clientHeight ===
      messages.current.scrollHeight;

    if (!shouldScroll) {
      messages.current.scrollTop = messages.current.scrollHeight;
    }
  }, [chats]);

  return (
    <div className={chatStyles.chatBoxWrapper}>
      <b>Chat:</b>
      <div ref={messages} className={chatStyles.chat}>
        {chats.map((chat, index) => (
          <p className={chatStyles.chatMessage} key={index}>
            {chat.type === "system" ? (
              <i>{chat.message}</i>
            ) : (
              <span>
                <b>
                  {chat.user.id == loggedInUserID ? (
                    <i>{chat.user.username}</i>
                  ) : (
                    <>{chat.user.username}</>
                  )}
                  :
                </b>
                {chat.message}
              </span>
            )}
          </p>
        ))}
      </div>
      <InputGroup
        onEnterPress={() => {
          if (message.trim().length > 0) {
            sendChatMessage && sendChatMessage(message.trim());
            setMessage("");
          }
        }}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={"Type your guess here"}
      ></InputGroup>
    </div>
  );
};

export default ChatBox;
