import React from "react";
import ReactDOM from "react-dom";
import create from "zustand";

export const useStore = create((set) => ({}));
const _components = {};
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

/**
 * 1. Create web components, assign channel ids
 * 2. Create script modules and wait for register calls
 * 3. Assign registered callbacks to channels
 */
const _messageListener = function (event) {
  if (event.data.type === "plugins") {
    for (const plugin of event.data.plugins) {
      for (const channel of plugin.channels) {
        if (channel.scriptContent) {
          _channels.push(channel);
          // initialize the plugin channels custom script and we'll later wait for it to register
          const script = document.createElement("script");
          script.type = "module";
          script.async = true;
          script.innerHTML = channel.scriptContent;
          document.head.appendChild(script);
        }
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
    } else if (event.data.type === "screen") {
      //     event.data.payload.type,
      //     event.data.payload.status
    }

    useStore.setState({ [event.data.type]: event.data.payload });
  }
};
window.addEventListener("message", _messageListener);

const _screenSelector = (store) => store.screen;

const App = ({ components }) => {
  const screen = useStore(_screenSelector);

  const screenFilter = ({ channel }) =>
    channel.screen === undefined ||
    (screen &&
      channel.screen.type === screen.type &&
      channel.screen.status === screen.status);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div id="top">
        {components["top"] &&
          components["top"]
            .filter(screenFilter)
            .map(({ JSXElement, channel }) => <JSXElement key={channel.id} />)}
      </div>
      <div
        id="left_right"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          id="left"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {components["left"] &&
            components["left"]
              .filter(screenFilter)
              .map(({ JSXElement, channel }) => (
                <JSXElement key={channel.id} />
              ))}
        </div>
        <div
          id="center"
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          {components["center"] &&
            components["center"]
              .filter(screenFilter)
              .map(({ JSXElement }) => <JSXElement key={JSXElement.key} />)}
        </div>
        <div
          id="right"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {components["right"] &&
            components["right"]
              .filter(screenFilter)
              .map(({ JSXElement, channel }) => (
                <JSXElement key={channel.id} />
              ))}
        </div>
      </div>
      <div
        id="bottom"
        style={{ height: "var(--minimap-height)", display: "flex" }}
      >
        {components["bottom"] &&
          components["bottom"]
            .filter(screenFilter)
            .map(({ JSXElement, channel }) => <JSXElement key={channel.id} />)}
      </div>
      {components["loose"] &&
        components["loose"]
          .filter(screenFilter)
          .map(({ JSXElement, channel }) => <JSXElement key={channel.id} />)}
    </div>
  );
};
export const registerChannel = (channelId, JSXElement) => {
  const channel = _channels.find((channel) => channel.id === channelId);
  if (channel) {
    const pos = channel.snap || "loose";
    const val = { channel, JSXElement };
    if (!_components[pos]) {
      _components[pos] = [];
    }
    _components[pos].push(val);

    ReactDOM.render(<App components={_components} />, document.body);
  } else {
    console.error(`Channel ${channelId} not found`);
  }
};
