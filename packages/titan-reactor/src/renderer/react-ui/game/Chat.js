import React, { useEffect } from "react";
import useGameStore, { CHAT_INTERVAL } from "../../stores/gameStore";

const simpleEquality = (a, b) => a === b;
const dimensionsSelector = (state) => state.dimensions.minimapSize;
const chatSelector = (state) => state.chat;
const removeOneFromChatSelector = (state) => state.removeOneFromChat;

const renderMessage = (msg) => {
  return (
    <span key={msg.content}>
      <span
        style={{
          color: msg.player.color.hex,
          textShadow: "1px 1px 2px black",
        }}
      >
        {msg.player.name}:
      </span>{" "}
      <span
        className="text-white"
        style={{
          textShadow: "1px 1px 2px black",
        }}
      >
        {msg.content}
      </span>
    </span>
  );
};

const Chat = () => {
  const minimapSize = useGameStore(dimensionsSelector, simpleEquality);
  const chat = useGameStore(chatSelector, simpleEquality);
  const removeOneFromChat = useGameStore(
    removeOneFromChatSelector,
    simpleEquality
  );

  useEffect(() => {
    const _interval = window.setInterval(() => {
      removeOneFromChat();
    }, CHAT_INTERVAL);
    return () => clearInterval(_interval);
  }, []);

  return (
    <div
      className="absolute pl-2 pointer-events-none select-none flex flex-col-reverse"
      style={{
        bottom: `${minimapSize + 80}px`,
        minHeight: "50vh",
        width: "40vw",
      }}
    >
      {chat.map(renderMessage)}
    </div>
  );
};

export default Chat;
