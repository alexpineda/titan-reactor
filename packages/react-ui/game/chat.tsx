import React, { useEffect, memo } from "react";
import { unstable_batchedUpdates } from "react-dom";
import {
  useGameStore,
  GameStore,
  CHAT_INTERVAL,
  ChatMessage,
} from "../../stores/game-store";

const chatSelector = (state: GameStore) => state.chat;
const removeOneFromChatSelector = (state: GameStore) => state.removeOneFromChat;

const Message = ({ msg }: { msg: ChatMessage }) => (
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

const renderMessage = (msg: ChatMessage) => <Message msg={msg} />;

const Chat = ({ minimapSize }: { minimapSize: number }) => {
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

export default memo(Chat);
