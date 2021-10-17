import React, { useEffect } from "react";
import { unstable_batchedUpdates } from "react-dom";
import useGameStore, { CHAT_INTERVAL } from "../../stores/gameStore";

const chatSelector = (state) => state.chat;
const removeOneFromChatSelector = (state) => state.removeOneFromChat;

const Message = ({ msg }) => (
  <span key={msg.id}>
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

const renderMessage = (msg) => <Message msg={msg} />;

const Chat = ({ minimapSize }) => {
  const chat = useGameStore(chatSelector);
  const removeOneFromChat = useGameStore(removeOneFromChatSelector);

  useEffect(() => {
    const _interval = window.setInterval(() => {
      unstable_batchedUpdates(() => removeOneFromChat());
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
