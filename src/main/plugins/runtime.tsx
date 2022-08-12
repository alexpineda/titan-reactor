import React, { useRef, useEffect, useContext, createContext } from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import create from "zustand";
import chunk from "https://cdn.skypack.dev/lodash.chunk";
import {
  MinimapDimensions,
  PluginStateMessage,
  Unit,
} from "titan-reactor-host";

type StateMessage = Partial<PluginStateMessage> & { firstInstall?: boolean };
const useStore = create<StateMessage>(() => ({
  screen: {
    screen: `@home`,
    error: null,
  },
}));

// friendly utilities
const _useLocale = (state: StateMessage) => state.language;
export const useLocale = () => {
  return useStore(_useLocale);
};

const _useReplay = (state: StateMessage) => state.world!.replay;
export const useReplay = () => {
  return useStore(_useReplay);
};

const _useMap = (state: StateMessage) => state.world!.map;
export const useMap = () => {
  return useStore(_useMap);
};

const _useFrame = (state: StateMessage) => state.frame;
export const useFrame = () => {
  return useStore(_useFrame);
};

const _usePlayers = (state: StateMessage) => state.world?.replay?.players;
export const usePlayers = () => {
  return useStore(_usePlayers) ?? [];
};

const _usePlayerFrame = (state: StateMessage) => state.frame!.playerData;
export const usePlayerFrame = () => {
  const playerData = useStore(_usePlayerFrame);
  return (id: number) => getPlayerInfo(id, playerData);
};

export const usePlayer = () => {
  const players = usePlayers();
  return (playerId: number) => {
    return players.find((player) => player.id === playerId);
  };
};

const _useSelectedUnits = (state: StateMessage) => state.units;
export const useSelectedUnits = () => {
  return useStore(_useSelectedUnits) ?? [];
};

const _useProgress = (state: StateMessage) => state.progress;
export const useProgress = () => {
  return useStore(_useProgress) ?? [];
};

const unitIsComplete = (unit: Unit) => {
  return (unit.statusFlags & 0x01) === 1;
};

export const getUnitIcon = (unit: Unit) => {
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

const mapUnitInProduction = (input, unit: Unit) =>
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
  const { unitProduction, upgrades, research } = useFrame()!;

  return [
    (playerId: number) =>
      chunk(unitProduction[playerId], 3)
        .map((unit) => mapUnitInProduction(unit, assets.bwDat.units[unit[0]]))
        .filter((unit) => unit),

    (playerId: number) =>
      chunk(upgrades[playerId], 3).map((upgrade) =>
        mapUpgradeInProduction(upgrade, assets.bwDat.upgrades[upgrade[0]])
      ),
    (playerId: number) =>
      chunk(research[playerId], 2).map((research) =>
        mapResearchInProduction(research, assets.bwDat.tech[research[0]])
      ),
  ];
};

export const getFriendlyTime = (frame: number) => {
  const t = Math.floor((frame * 42) / 1000);
  const minutes = Math.floor(t / 60);
  const seconds = Math.floor(t % 60);

  return `${minutes}:${("00" + seconds).slice(-2)}`;
};

export const openUrl = (url: string) =>
  window.parent.postMessage(
    {
      type: "system:open-url",
      payload: url,
    },
    "*"
  );

// plugin specific configuration
const useConfig = create<any>(() => ({}));

type Component = {
  pluginId: string;
  id: number;
  order: number;
  messageHandler: null;
  JSXElement: React.ReactNode;
  //TODO: stronger types
  snap: string;
};

type ComponentsStore = {
  components: Component[];
  add: (component: Component) => void;
  remove: (id: string) => void;
};

const useComponents = create<ComponentsStore>((set, get) => ({
  components: [],
  add: (item) => set({ components: [...get().components, item] }),
  remove: (id) =>
    set({ components: get().components.filter((c) => c.pluginId !== id) }),
}));

const setPluginStyleSheet = (id: string, content: string) => {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = content;
};

const removePluginStylesheet = (id: string) => {
  const style = document.getElementById(id);
  style && document.head.removeChild(style);
};

const _plugins = {};

/**
 * Simplify the config values for the React side of things
 */
function processConfigBeforeReceive(config: any) {
  if (config) {
    const configCopy: {
      [key: string]: any;
    } = {
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

const _removePlugin = (pluginId: string) => {
  const plugin = _plugins[pluginId];
  if (!plugin || pluginId !== plugin.id) {
    return;
  }

  useComponents.getState().remove(plugin.id);

  plugin.script.remove();

  delete _plugins[plugin.id];
};

const _addPlugin = (plugin) => {
  if (!plugin.indexFile) {
    return;
  }

  // initialize the plugin channels custom script and we'll later wait for it to register
  const script = document.createElement("script");
  script.type = "module";
  script.async = true;
  script.src = `${plugin.path}/${plugin.indexFile}`;
  document.head.appendChild(script);

  _plugins[plugin.id] = {
    id: plugin.id,
    messageHandler: new EventTarget(),
    script,
  };

  useConfig.setState({
    [plugin.id]: processConfigBeforeReceive(plugin.config),
  });
};

export let assets = {};
export let enums = {};

class RollingValue {
  #lastTime = 0;
  upSpeed: number;
  downSpeed: number;
  _value: number;
  _rollingValue: number;
  _running = false;
  _direction = false;
  _speed = 0;

  constructor(value = 0, upSpeed = 80, downSpeed = 30) {
    this.upSpeed = upSpeed;
    this.downSpeed = downSpeed;

    this._value = typeof value === "number" ? value : 0;
    this._rollingValue = this._value;
  }
  update(delta: number) {
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

  start(value: number, onUpdate: (value: number) => void) {
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
    const raf = (elapsed: number) => {
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

export const RollingNumber = ({
  value,
  upSpeed,
  downSpeed,
  ...props
}: {
  value: number;
  upSpeed: number;
  downSpeed: number;
}) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const rollingNumber = useRef(
    new RollingValue(value, upSpeed ?? 80, downSpeed ?? 30)
  );

  useEffect(() => {
    if (numberRef.current) {
      numberRef.current.textContent = "" + value;
    }
  }, []);

  useEffect(() => {
    rollingNumber.current.start(value, (val) => {
      if (numberRef.current) {
        numberRef.current.textContent = "" + val;
      }
    });

    return () => {
      rollingNumber.current.stop();
    };
  }, [value]);

  return <span ref={numberRef} {...props}></span>;
};

class PlayerInfo {
  _struct_size = 7;
  playerId = 0;
  playerData: Required<StateMessage>["frame"]["playerData"] = new Int32Array();

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
const getPlayerInfo = (
  playerId: number,
  playerData: Required<StateMessage>["frame"]["playerData"]
) => {
  playerInfo.playerData = playerData;
  playerInfo.playerId = playerId;
  return playerInfo;
};

const updateDimensionsCss = (dimensions: MinimapDimensions) => {
  setPluginStyleSheet(
    "game-dimension-css-vars",
    `:root {
        --minimap-width: ${dimensions.minimapWidth}px;
        --minimap-height: ${dimensions.minimapHeight}px;
      }`
  );
};

export const updateAvailable = {};

const _messageListener = function (event: MessageEvent) {
  if (event.data.type.startsWith("system:")) {
    if (event.data.type === "system:ready") {
      useStore.setState(event.data.payload.initialStore);

      updateDimensionsCss(event.data.payload.initialStore.dimensions);

      Object.assign(assets, event.data.payload.assets);
      Object.assign(enums, event.data.payload.enums);

      event.data.payload.plugins.forEach(_addPlugin);
      ReactDOM.render(<AppWrapper />, document.body);
    } else if (event.data.type === "system:plugins-enabled") {
      event.data.payload.forEach(_addPlugin);
    } else if (event.data.type === "system:plugin-disabled") {
      _removePlugin(event.data.payload);
    } else if (event.data.type === "system:plugin-config-changed") {
      useConfig.setState({
        [event.data.payload.pluginId]: processConfigBeforeReceive(
          event.data.payload.config
        ),
      });
    } else if (event.data.type === "system:mouse-click") {
      const { clientX, clientY, button, shiftKey, ctrlKey } =
        event.data.payload;

      const element = document.elementFromPoint(clientX, clientY)!;
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

const PluginContext = createContext(null);

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

  return (message: any) =>
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

export const useStyleSheet = (content: string, deps = []) => {
  const { pluginId } = useContext(PluginContext);
  useEffect(() => {
    setPluginStyleSheet(pluginId, content);
  }, [content, ...deps]);

  useEffect(() => {
    return () => removePluginStylesheet(pluginId);
  }, []);
};

export const proxyFetch = (url: string) =>
  fetch(`?proxy=${encodeURIComponent(url)}`);

//registerComponent
export const _rc = (
  pluginId: string,
  component,
  JSXElement: React.ReactNode
) => {
  const plugin = _plugins[pluginId];
  if (!plugin) {
    return;
  }

  component.id = Math.random();
  component.order = component.order ?? 0;

  useComponents.getState().add({
    ...component,
    pluginId,
    id: Math.random(),
    order: component.order ?? 0,
    messageHandler: plugin.messageHandler,
    JSXElement,
    snap: component.snap ?? "loose",
  });
};

const AppWrapper = () => {
  const components = useComponents((state) => state.components);
  return <App components={components} />;
};

const _screenSelector = (store: StateMessage) => store.screen;

const GlobalErrorState = ({ error }: { error: any }) => {
  return (
    <div
      style={{
        position: "absolute",
        zIndex: "-999",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%)`,
        cursor: "wait",
        color: "#ffeedd",
        fontFamily: "Conthrax",
      }}
    >
      <p style={{ fontSize: "150%" }}>Uh oh!</p>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          color: "#aa6677",
          fontSize: "150%",
        }}
      >
        {error}
      </p>
    </div>
  );
};

const PluginComponent = ({
  id,
  JSXElement,
}: {
  id: string;
  JSXElement: React.ReactNode;
}) => {
  const config = usePluginConfig();
  return (
    <ErrorBoundary key={id}>
      <div style={{ display: config._visible ? "block" : "none" }}>
        <JSXElement />
      </div>
    </ErrorBoundary>
  );
};

const _firstInstall = (store: StateMessage) => store.firstInstall;

const orderSort = (a, b) => {
  return a.order - b.order;
};

const App = ({ components }) => {
  const { screen, error } = useStore(_screenSelector)!;
  const firstInstall = useStore(_firstInstall);
  const containerDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerDiv.current) return;

    if (["@home", "@loading"].includes(screen)) {
      containerDiv.current.style.opacity = "1";
    } else {
      let opacity = 0;
      const cancelId = setInterval(() => {
        opacity += 0.025;
        containerDiv.current!.style.opacity = "" + Math.min(opacity, 1);
        if (opacity >= 1) {
          clearInterval(cancelId);
        }
      }, 50);
      return () => clearInterval(cancelId);
    }
  }, [screen]);

  const appLoaded = screen && screen !== "@loading";

  const screenFilter = (component) =>
    appLoaded &&
    ["@replay", "@map"].includes(screen) &&
    (component.screen ?? "").includes(screen);

  const renderComponent = (component) => (
    <PluginContext.Provider value={component}>
      <PluginComponent key={component.id} {...component} />
    </PluginContext.Provider>
  );

  return (
    <div
      ref={containerDiv}
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
      {error && !firstInstall && <GlobalErrorState error={error} />}

      <div
        id="top-container"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          id="top-left"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {components
            .filter((c) => c.snap === "top-left")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
        <div
          id="top"
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          {components
            .filter((c) => c.snap === "top")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
        <div
          id="top-right"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {components
            .filter((c) => c.snap === "top-right")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
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
            marginBottom: "var(--minimap-height)",
          }}
        >
          {components
            .filter((c) => c.snap === "left")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
        <div
          id="center_container"
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          <div
            id="center"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            {components
              .filter((c) => c.snap === "center")
              .filter(screenFilter)
              .sort(orderSort)
              .map(renderComponent)}
          </div>
          <div
            id="bottom"
            style={{
              display: "flex",
            }}
          >
            {components
              .filter((c) => c.snap === "bottom")
              .filter(screenFilter)
              .sort(orderSort)
              .map(renderComponent)}
          </div>
        </div>
        <div
          id="right"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {components
            .filter((c) => c.snap === "right")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
      </div>

      {components
        .filter((c) => c.snap === "loose")
        .filter(screenFilter)
        .sort(orderSort)
        .map(renderComponent)}
    </div>
  );
};

class ErrorBoundary extends React.Component {
  override state: {
    hasError: boolean;
  };

  override props: {
    children?: React.ReactNode;
  } = {};

  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return <>☠️</>;
    }

    return this.props.children;
  }
}

ReactDOM.render(<AppWrapper />, document.body);

window.parent.postMessage(
  {
    type: "system:runtime-ready",
  },
  "*"
);
