import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import create from "zustand";

export const useStore = create(() => ({}));
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

const _messageListener = function (event) {
  if (event.data.type === "plugins") {
    useStore.setState(event.data.initialStore, true);
    console.log("initial store", event.data.initialStore);

    for (const plugin of event.data.plugins) {
      for (const channel of plugin.channels) {
        if (channel.scriptContent) {
          channel.getUserConfig = () => plugin.userConfig;
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
            --game-width: ${event.data.payload.width}px;
            --game-height: ${event.data.payload.height}px;
            --minimap-width: ${event.data.payload.minimapWidth}px;
            --minimap-height: ${event.data.payload.minimapHeight}px;
          }`
      );
    }

    useStore.setState({ [event.data.type]: event.data.payload });
  }
};
window.addEventListener("message", _messageListener);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>☠️</>;
    }

    return this.props.children;
  }
}

const _screenSelector = (store) => store.screen;

const App = ({ components }) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const screen = useStore(_screenSelector);

  useEffect(() => {
    if (!appLoaded && screen.type === 0 && screen.status === 1) {
      setAppLoaded(true);
    }
  }, [screen]);

  const screenFilter = ({ channel }) =>
    appLoaded &&
    (channel.screen === undefined ||
      (screen &&
        channel.screen.type === screen.type &&
        channel.screen.status === screen.status));

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
            .map(({ JSXElement, channel }) => (
              <ErrorBoundary key={channel.id}>
                <JSXElement userConfig={channel.getUserConfig()} />
              </ErrorBoundary>
            ))}
      </div>
      <div
        id="left_right"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        <div
          id="left"
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          {components["left"] &&
            components["left"]
              .filter(screenFilter)
              .map(({ JSXElement, channel }) => (
                <ErrorBoundary key={channel.id}>
                  <JSXElement userConfig={channel.getUserConfig()} />
                </ErrorBoundary>
              ))}
        </div>
        <div
          id="center"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          {components["center"] &&
            components["center"]
              .filter(screenFilter)
              .map(({ JSXElement, channel }) => (
                <ErrorBoundary key={channel.id}>
                  <JSXElement userConfig={channel.getUserConfig()} />
                </ErrorBoundary>
              ))}
        </div>
        <div
          id="right"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {components["right"] &&
            components["right"]
              .filter(screenFilter)
              .map(({ JSXElement, channel }) => (
                <ErrorBoundary key={channel.id}>
                  <JSXElement userConfig={channel.getUserConfig()} />
                </ErrorBoundary>
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
            .map(({ JSXElement, channel }) => (
              <ErrorBoundary key={channel.id}>
                <JSXElement userConfig={channel.getUserConfig()} />
              </ErrorBoundary>
            ))}
      </div>
      {components["loose"] &&
        components["loose"]
          .filter(screenFilter)
          .map(({ JSXElement, channel }) => (
            <ErrorBoundary key={channel.id}>
              <JSXElement userConfig={channel.getUserConfig()} />
            </ErrorBoundary>
          ))}
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

/**
 * For plugins with iframe = "isolated".
 * With IFrame based plugins, we need to wait for the iframe to load
 * in order for us to report the document content size to Titan Reactor so it can be placed optimally.
 *
 * Call pluginContentReady *once* with your plugins outer most container element.
 */
export const pluginContentReady = (outerElement, channelId) => {
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const contentBoxSize = entry.contentBoxSize[0];

      // we can only send content.ready once, so make sure our div is actually sized
      if (contentBoxSize.inlineSize > 0 && contentBoxSize.blockSize > 0) {
        parent.postMessage(
          {
            type: "content.ready",
            channelId,
            height: `${contentBoxSize.blockSize}px`,
            width: `${contentBoxSize.inlineSize}px`,
          },
          "*"
        );
        resizeObserver.unobserve(outerElement);
      }
    }
  });

  resizeObserver.observe(outerElement);
};
