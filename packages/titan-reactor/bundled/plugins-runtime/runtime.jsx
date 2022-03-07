import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import create from "zustand";
import App from "./runtime/app.jsx";

// game state
export const useStore = create(() => ({}));

// plugin specific configuration
const useConfig = create(() => ({}));
export const usePluginConfig = (pluginId) =>
  useConfig((store) => store[pluginId]);

const _components = {};

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

const _plugins = [];

const _messageListener = function (event) {
  if (event.data.type.startsWith("system:")) {
    if (event.data.type === "system:ready") {
      useStore.setState(event.data.initialStore);

      for (const plugin of event.data.plugins) {
        _plugins.push(plugin);

        // initialize the plugin channels custom script and we'll later wait for it to register
        const script = document.createElement("script");
        script.type = "module";
        script.async = true;
        script.src = `${plugin.path}/index.jsx?plugin-id=${plugin.id}`;
        document.head.appendChild(script);

        console.log(plugin);
        useConfig.setState({ [plugin.id]: plugin.config });
      }
    } else if (event.data.type === "system:plugin-config-changed") {
      useConfig.setState({ [event.data.pluginId]: event.data.config });
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

let _channelIds = 0;
export const registerComponent = (component, JSXElement) => {
  component.id = `${component.pluginId}_${++_channelIds}`;

  const pos = component.snap || "loose";
  const val = { component, JSXElement };
  if (!_components[pos]) {
    _components[pos] = [];
  }
  _components[pos].push(val);

  ReactDOM.render(<App components={_components} />, document.body);
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
