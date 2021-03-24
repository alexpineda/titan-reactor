import React, { useEffect } from "react";
import shallow from "zustand/shallow";
import useGameStore, { CHAT_INTERVAL } from "../../stores/gameStore";

export default () => {
  const { dimensions, chat, removeOneFromChat } = useGameStore(
    (state) => ({
      dimensions: state.dimensions,
      chat: state.chat,
      removeOneFromChat: state.removeOneFromChat,
    }),
    shallow
  );

  useEffect(() => {
    const _interval = window.setInterval(() => {
      removeOneFromChat();
    }, CHAT_INTERVAL);
    return () => clearInterval(_interval);
  }, []);

  return (
    <ul
      className="absolute pl-2 pointer-events-none"
      style={{ bottom: `${dimensions.minimapSize + 80}px` }}
    >
      {chat.map((msg) => {
        return (
          <li key={msg.content}>
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
          </li>
        );
      })}
    </ul>
  );
};
