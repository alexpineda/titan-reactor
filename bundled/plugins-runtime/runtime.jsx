import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import create from "zustand";
import App from "./runtime/app.jsx";

// game state
export const useStore = create(() => ({}));

// plugin specific configuration
const useConfig = create(() => ({}));
export const usePluginConfig = (pluginId) =>
  useConfig((store) => store[pluginId]);

const useComponents = create(() => ({}));

export const setStyleSheet = (id, content) => {
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

const _addPlugin = (plugin) => {
  _plugins.push(plugin);

  // initialize the plugin channels custom script and we'll later wait for it to register
  const script = document.createElement("script");
  script.type = "module";
  script.async = true;
  script.src = `${plugin.path}/index.jsx?plugin-id=${plugin.id}`;
  document.head.appendChild(script);

  useConfig.setState({ [plugin.id]: plugin.config });
};

export let assets = {};

// export const createAltColors = (color: string): AltColors => {
//   let darken = new Color(0.1, 0.1, 0.1);
//   const test = { h: 0, s: 0, l: 0 };
//   new Color().setStyle(color).getHSL(test);

//   if (test.l > 0.6) {
//     darken = new Color(0.2, 0.2, 0.2);
//   }
//   const darker = `#${new Color().setStyle(color).sub(darken).getHexString()}`;

//   const hueShift = `#${new Color()
//     .setStyle(darker)
//     .offsetHSL(0.01, 0, 0)
//     .getHexString()}66`;
//   const lightShift = `#${new Color()
//     .setStyle(darker)
//     .offsetHSL(0, 0, 0.1)
//     .getHexString()}`;

//   return {
//     darker,
//     hueShift,
//     lightShift,
//   };
// };

export class RollingNumber {
  constructor(value = 0) {
    this.upSpeed = 80;
    this.downSpeed = 30;
    this._value = value;
    this._rollingValue = value;
  }
  update(delta) {
    if (this._running && delta >= this._speed) {
      this._rollingValue = this._direction
        ? Math.min(this._value, this._rollingValue + 1)
        : Math.max(this._value, this._rollingValue - 1);

      if (this._rollingValue === this._value) {
        this._running = false;
      }
      return true;
    }
    return false;
  }

  get rollingValue() {
    return this._rollingValue;
  }

  get isRunning() {
    return this._running;
  }

  start(val, onUpdate) {
    if (val === this._value) return;
    this._value = val;

    const direction = val > this._rollingValue;

    if (this._running && direction === this._direction) {
      return;
    }

    this._direction = direction;
    this._speed = direction ? this.upSpeed : this.downSpeed;
    this._running = true;

    let lastTime = 0;
    const raf = (elapsed) => {
      const delta = elapsed - lastTime;
      this.update(delta);
      onUpdate(this._rollingValue);

      if (this.isRunning) {
        requestAnimationFrame(raf);
      }
    };

    requestAnimationFrame(raf);
  }

  stop() {
    this._running = false;
  }
}

export const RollingResource = ({ value, ...props }) => {
  const numberRef = useRef(null);
  const rollingNumber = useRef(new RollingNumber(value));

  useEffect(() => {
    rollingNumber.current.start(value, (val) => {
      if (numberRef.current) {
        numberRef.current.textContent = val;
      }
    });

    return () => {
      rollingNumber.current.stop();
    };
  }, [value]);

  return <span ref={numberRef} {...props}></span>;
};

class PlayerInfo {
  constructor() {
    this._struct_size = 7;
    this.playerId = 0;
  }

  get _offset() {
    return this._struct_size * this.playerId;
  }

  get minerals() {
    return this.playerData[this._offset + 0];
  }

  get vespeneGas() {
    return this.playerData[this._offset + 1];
  }
  get supply() {
    return this.playerData[this._offset + 2];
  }

  get supplyMax() {
    return this.playerData[this._offset + 3];
  }

  get workerSupply() {
    return this.playerData[this._offset + 4];
  }

  get armySupply() {
    return this.playerData[this._offset + 5];
  }

  get apm() {
    return this.playerData[this._offset + 6];
  }
}

const playerInfo = new PlayerInfo();
export const getPlayerInfo = (playerId, playerData) => {
  playerInfo.playerData = playerData;
  playerInfo.playerId = playerId;
  return playerInfo;
};

const _messageListener = function (event) {
  if (event.data.type.startsWith("system:")) {
    if (event.data.type === "system:ready") {
      useStore.setState(event.data.payload.initialStore);
      event.data.payload.plugins.forEach(_addPlugin);
      ReactDOM.render(<AppWrapper />, document.body);
    } else if (event.data.type === "system:assets") {
      Object.assign(assets, event.data.payload.assets);
      ReactDOM.render(<AppWrapper />, document.body);
    } else if (event.data.type === "system:plugin-config-changed") {
      useConfig.setState({ [event.data.payload.pluginId]: event.data.payload.config });
    } else if (event.data.type === "system:plugins-enabled") {
      for (const plugin of event.data.payload.plugins) {
        _addPlugin(plugin);
      }
    } else if (event.data.type === "system:mouse.click") {
      document
        .elementFromPoint(event.data.payload.x, event.data.payload.y)
        .click();
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

  const _components = useComponents.getState();
  if (!_components[pos]) {
    _components[pos] = [];
  }
  _components[pos].push(val);
  useComponents.setState({ ..._components });
};

const AppWrapper = () => {
  const components = useComponents();
  return <App components={components} />;
};

/**
 * A utility function for plugins with iframe = "isolated".
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
