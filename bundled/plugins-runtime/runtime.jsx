import React, { useRef, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import create from "zustand";
import chunk from "https://cdn.skypack.dev/lodash.chunk";
import App from "./runtime/app.jsx";

// game state
export const useStore = create(() => ({}));

// friendly utilities
const _useLocale = (state) => state.language;
export const useLocale = () => {
  return useStore(_useLocale);
};

const _useReplay = (state) => state.world.replay;
export const useReplay = () => {
  return useStore(_useReplay);
};

const _useMap = (state) => state.world.map;
export const useMap = () => {
  return useStore(_useMap);
};

const _useFrame = (state) => state.frame;
export const useFrame = () => {
  return useStore(_useFrame);
};

const _usePlayers = (state) => state.world?.replay?.players;
export const usePlayers = () => {
  return useStore(_usePlayers) ?? [];
};

const _usePlayerFrame = (state) => state.frame.playerData;
export const usePlayerFrame = () => {
  const playerData = useStore(_usePlayerFrame);
  return (id) => getPlayerInfo(id, playerData);
};

export const usePlayer = () => {
  const players = usePlayers();
  return (playerId) => {
    return players.find((player) => player.id === playerId);
  };
};

const _useSelectedUnits = (state) => state.units;
export const useSelectedUnits = () => {
  return useStore(_useSelectedUnits) ?? [];
};

const unitIsComplete = (unit) => {
  return unit.statusFlags & (0x01 === 1);
};

export const getUnitIcon = (unit) => {
  if (
    (unit.extras.dat.isBuilding &&
      !unit.extras.dat.isZerg &&
      unitIsComplete(unit) &&
      unit.buildQueue?.length) ||
    (unit.extras.dat.isZerg &&
      !unit.extras.dat.isBuilding &&
      unit.buildQueue?.length)
  ) {
    return unit.buildQueue[0];
  }

  if (unitIsComplete(unit) && unit.remainingTrainTime) {
    if (unit.typeId === enums.unitTypes.reaver) {
      return enums.unitTypes.scarab;
    } else if (unit.typeId === enums.unitTypes.carrier) {
      return enums.unitTypes.interceptor;
    } else if (unit.typeId === enums.unitTypes.nuclearSilo) {
      return enums.unitTypes.nuclearMissile;
    }
  }

  return null;
};

const mapUnitInProduction = (input, unit) =>
  unit.isTurret
    ? null
    : {
        typeId: input[0],
        icon: input[0],
        count: input[1],
        progress: input[2] / unit.buildTime,
        isUnit: true,
      };

const mapUpgradeInProduction = (input, upgrade) => ({
  typeId: input[0],
  icon: upgrade.icon,
  level: input[1],
  isUpgrade: true,
  progress:
    input[2] /
    (upgrade.researchTimeBase + upgrade.researchTimeFactor * input[1]),
});

const mapResearchInProduction = (input, research) => ({
  typeId: input[0],
  icon: research.icon,
  progress: input[1] / research.researchTime,
  isResearch: true,
});

export const useProduction = () => {
  const { unitProduction, upgrades, research } = useFrame();

  return [
    (playerId) =>
      chunk(unitProduction[playerId], 3)
        .map((unit) => mapUnitInProduction(unit, assets.bwDat.units[unit[0]]))
        .filter((unit) => unit),

    (playerId) =>
      chunk(upgrades[playerId], 3).map((upgrade) =>
        mapUpgradeInProduction(upgrade, assets.bwDat.upgrades[upgrade[0]])
      ),
    (playerId) =>
      chunk(research[playerId], 2).map((research) =>
        mapResearchInProduction(research, assets.bwDat.tech[research[0]])
      ),
  ];
};
// plugin specific configuration
const useConfig = create(() => ({}));

const useComponents = create(() => ({}));

const setPluginStyleSheet = (id, content) => {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = content;
};

const removePluginStylesheet = (id) => {
  const style = document.getElementById(id);
  style && document.head.removeChild(style);
};

const _plugins = {};

/**
 * Simplify the config values for the React side of things
 */
function processConfigBeforeReceive(config) {
  if (config) {
    const configCopy = {
      $$meta: config,
    };
    Object.keys(config).forEach((key) => {
      if (config[key]?.value !== undefined) {
        if (config[key]?.factor !== undefined) {
          configCopy[key] = config[key].value * config[key].factor;
        } else {
          configCopy[key] = config[key].value;
        }
      }
    });
    return configCopy;
  }
}

const _addPlugin = (plugin) => {
  if (!plugin.hasUI) {
    return;
  }

  _plugins[plugin.id] = {
    id: plugin.id,
    messageHandler: new EventTarget(),
  };

  // initialize the plugin channels custom script and we'll later wait for it to register
  const script = document.createElement("script");
  script.type = "module";
  script.async = true;
  script.src = `${plugin.path}/index.jsx?plugin-id=${plugin.id}`;
  document.head.appendChild(script);

  useConfig.setState({
    [plugin.id]: processConfigBeforeReceive(plugin.config),
  });
};

export let assets = {};
export let enums = {};

class RollingValue {
  #lastTime = 0;
  constructor(value = 0, upSpeed = 80, downSpeed = 30) {
    this.upSpeed = upSpeed;
    this.downSpeed = downSpeed;

    this._value = typeof value === "number" ? value : 0;
    this._rollingValue = this._value;
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

  start(value, onUpdate) {
    if (value === this._value) return;
    this._value = typeof value === "number" ? value : 0;

    const direction = this._value > this._rollingValue;

    if (this._running && direction === this._direction) {
      return;
    }

    this._direction = direction;
    this._speed = direction ? this.upSpeed : this.downSpeed;
    this._running = true;

    this.#lastTime = 0;
    const raf = (elapsed) => {
      const delta = elapsed - this.#lastTime;
      if (this.update(delta)) {
        this.#lastTime = elapsed;
        onUpdate(this._rollingValue);
      }

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

export const RollingNumber = ({ value, upSpeed, downSpeed, ...props }) => {
  const numberRef = useRef(null);
  const rollingNumber = useRef(
    new RollingValue(value, upSpeed ?? 80, downSpeed ?? 30)
  );

  useEffect(() => {
    if (numberRef.current) {
      numberRef.current.textContent = value;
    }
  }, []);

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
    this.playerData = [];
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
const getPlayerInfo = (playerId, playerData) => {
  playerInfo.playerData = playerData;
  playerInfo.playerId = playerId;
  return playerInfo;
};

const updateDimensionsCss = (dimensions) => {
  setPluginStyleSheet(
    "game-dimension-css-vars",
    `:root {
        --minimap-width: ${dimensions.minimapWidth}px;
        --minimap-height: ${dimensions.minimapHeight}px;
      }`
  );
};

export const updateAvailable = {};

const _messageListener = function (event) {
  if (event.data.type.startsWith("system:")) {
    if (event.data.type === "system:ready") {
      useStore.setState(event.data.payload.initialStore);

      updateDimensionsCss(event.data.payload.initialStore.dimensions);

      Object.assign(assets, event.data.payload.assets);
      Object.assign(enums, event.data.payload.enums);
      if (event.data.payload.updateAvailable) {
        Object.assign(updateAvailable, event.data.payload.updateAvailable);
      }

      ReactDOM.render(<AppWrapper />, document.body);

      event.data.payload.plugins.forEach(_addPlugin);
      ReactDOM.render(<AppWrapper />, document.body);
    } else if (event.data.type === "system:plugin-config-changed") {
      useConfig.setState({
        [event.data.payload.pluginId]: processConfigBeforeReceive(
          event.data.payload.config
        ),
      });
    } else if (event.data.type === "system:mouse-click") {
      const { clientX, clientY, button, shiftKey, ctrlKey } =
        event.data.payload;

      const element = document.elementFromPoint(clientX, clientY);
      ReactTestUtils.Simulate.click(element, {
        button,
        shiftKey,
        ctrlKey,
        clientX,
        clientY,
      });
    } else if (event.data.type === "system:first-install") {
      useStore.setState({ firstInstall: true });
    } else if (event.data.type === "system:custom-message") {
      const { message, pluginId } = event.data.payload;
      const plugin = _plugins[pluginId];
      if (plugin) {
        const event = new CustomEvent("message", { detail: message });
        plugin.messageHandler.dispatchEvent(event);
      }
    }
  } else {
    if (event.data.type === "dimensions") {
      updateDimensionsCss(event.data.payload);
    }
    useStore.setState({ [event.data.type]: event.data.payload });
  }
};
window.addEventListener("message", _messageListener);

export const PluginContext = React.createContext();

export const useMessage = (cb, deps = []) => {
  const { messageHandler } = useContext(PluginContext);

  useEffect(() => {
    const handler = ({ detail }) => {
      typeof cb === "function" && cb(detail);
    };
    messageHandler.addEventListener("message", handler);
    return () => messageHandler.removeEventListener("message", handler);
  }, deps);
};

export const useSendMessage = () => {
  const { pluginId } = useContext(PluginContext);

  return (message) =>
    window.parent.postMessage(
      {
        type: "system:custom-message",
        payload: {
          pluginId,
          message,
        },
      },
      "*"
    );
};

export const usePluginConfig = () => {
  const { pluginId } = useContext(PluginContext);
  return useConfig((store) => store[pluginId]);
};

export const useStyleSheet = (content, deps = []) => {
  const { pluginId } = useContext(PluginContext);
  useEffect(() => {
    setPluginStyleSheet(pluginId, content);
  }, [content, ...deps]);

  useEffect(() => {
    return () => removePluginStylesheet(pluginId);
  }, []);
};

let _channelIds = 0;
export const registerComponent = (component, JSXElement) => {
  const plugin = _plugins[component.pluginId];
  if (!plugin) {
    console.warn(`Plugin ${component.pluginId} not found`);
    return;
  }

  component.id = `${component.pluginId}_${++_channelIds}`;
  component.order = component.order ?? 0;
  component.messageHandler = plugin.messageHandler;

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
