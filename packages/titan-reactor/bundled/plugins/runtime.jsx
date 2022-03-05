import React from "react";
import ReactDOM from "react-dom";

const _state = {};
let _plugins = [];
const _channels = [];

const setStyleSheet = (id, content) => {
  let style;

  style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = content;
};

const _messageListener = function (event) {
  //TODO: check location search for plugin id if isolated
  if (event.data.type === "plugins") {
    _plugins = event.data.plugins;
    for (const plugin of event.data.plugins) {
      if (plugin.jsx) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = plugin.jsx;
        document.body.appendChild(script);
      }
    }
  } else {
    if (event.data.type === "dimensions") {
      setStyleSheet(
        "game-dimension-css-vars",
        `:root {
            --game-width: ${event.data.payload.width}px,
            --game-height: ${event.data.payload.height}px,
            --minimap-width: ${event.data.payload.minimapWidth}px,
            --minimap-height: ${event.data.payload.minimapHeight}px,
          }`
      );
    }

    _state[event.data.type] = event.data.payload;
    ReactDOM.render(
      <App state={_state} event={event.data} />,
      document.getElementById("app")
    );

    // for (const channel of _channels) {
    //   if (event.data.type === "screen") {
    //     if (
    //       channel.config.screens.length === 0 ||
    //       channel.config.screens.find(
    //         (screen) =>
    //           screen.type === event.data.payload.type &&
    //           screen.status === event.data.payload.status
    //       )
    //     ) {
    //       if (channel.config.position === "fullscreen") {
    //         channel.style.left = "0";
    //         channel.style.top = "0";
    //         channel.style.right = "0";
    //         channel.style.bottom = "0";
    //       } else if (channel.config.position === "top-left") {
    //         channel.style.left = "0";
    //         channel.style.top = "0";
    //         channel.style.right = "auto";
    //         channel.style.bottom = "auto";
    //       }
    //       channel.style.display = "block";
    //     } else {
    //       channel.style.display = "none";
    //     }
    //   }

    //   channel.render();
    // }
  }
};
window.addEventListener("message", _messageListener);

const App = ({ state, event }) => {
  return <div>{_channels.map((c) => c.render({ state, event }))}</div>;
};

// useOnFrame
// useScreen
// useWorld

export default (id, config) => {
  for (const channel of config) {
    _channels.push(channel);
  }
};
