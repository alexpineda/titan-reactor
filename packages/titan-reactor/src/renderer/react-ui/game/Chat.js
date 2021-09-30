import React, { useEffect } from "react";
import shallow from "zustand/shallow";
import useGameStore, { CHAT_INTERVAL } from "../../stores/gameStore";

const gameStoreSelector = (state) => ({
  dimensions: state.dimensions,
  chat: state.chat,
  removeOneFromChat: state.removeOneFromChat,
});

export default () => {
  const { dimensions, chat, removeOneFromChat } = useGameStore(
    gameStoreSelector,
    shallow
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
        bottom: `${dimensions.minimapSize + 80}px`,
        minHeight: "50vh",
        width: "40vw",
      }}
    >
      {chat.map((msg) => {
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
      })}
    </div>
  );
};
