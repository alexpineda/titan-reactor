import type { DumpedUnit } from "@core/unit";
import type { PluginStateMessage, SystemReadyMessage } from "@plugins/plugin-system-ui";
import type { MinimapDimensions } from "@render/minimap-dimensions";
import type { PluginMetaData, TechDataDAT, UnitDAT, UpgradeDAT } from "common/types";
import React, { useRef, useEffect, useContext, createContext } from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import create from "zustand";

// import { Canvas, useFrame as r3fUseFrame } from 'https://cdn.jsdelivr.net/npm/@react-three/fiber@8.14.5/+esm'

// split up an array into chunks of size n
function chunk(arr: Int32Array, n: number) {
    const chunks = [];
    let i = 0;
    while (i < arr.length) {
        chunks.push(arr.slice(i, (i += n)));
    }
    return chunks;
}

export interface Component {
    pluginId: string;
    id: number;
    order: number | undefined;
    messageHandler: EventTarget;
    JSXElement: React.FC<any>;
    snap: string;
}

interface Plugin {
    id: string;
    messageHandler: EventTarget;
    script: HTMLScriptElement;
}

type StateMessage = Partial<PluginStateMessage>;
const useStore = create<StateMessage>(() => ({
    screen: {
        screen: "@home",
        error: undefined,
    },
}));

// friendly utilities
const _useLocale = (state: StateMessage) => state.language;
/**
 * @public
 * Use the translation function to translate a string
 */
export const useLocale = () => {
    return useStore(_useLocale);
};

const _useReplay = (state: StateMessage) => state.world!.replay;
/**
 * @public
 * The replay header information.
 */
export const useReplay = () => {
    return useStore(_useReplay);
};

const _useMap = (state: StateMessage) => state.world!.map;
/**
 * @public
 * The map information.
 */
export const useMap = () => {
    return useStore(_useMap);
};

const _useFrame = (state: StateMessage) => state.frame;
/**
 * @public
 * The current frame of the replay.
 */
export const useFrame = () => {
    return useStore(_useFrame);
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const _usePlayers = (state: StateMessage) => state.world?.replay?.players;
/**
 * @public
 * All players in the current replay.
 */
export const usePlayers = () => {
    return useStore(_usePlayers) ?? [];
};

const _usePlayerFrame = (state: StateMessage) => state.production!.playerData;
/**
 * @public
 * Returns a function getPlayerInfo that can be used to get resource information about a player.
 */
export const usePlayerFrame = () => {
    const playerData = useStore(_usePlayerFrame);
    return (id: number) => getPlayerInfo(id, playerData);
};

/**
 * @public
 * Returns a function that can be used to get player information.
 */
export const usePlayer = () => {
    const players = usePlayers();
    return (playerId: number) => {
        return players.find((player) => player.id === playerId);
    };
};

const _useSelectedUnits = (state: StateMessage) => state.units;
/**
 * @public
 * Returns user selected units (if any).
 */
export const useSelectedUnits = () => {
    return (useStore(_useSelectedUnits) ?? []).map((unit) => {
        return {
            ...unit,
            extras: {
                dat: assets.bwDat.units[unit.typeId!],
            },
        };
    });
};

const unitIsComplete = (unit: DumpedUnit) => {
    return (unit.statusFlags! & 0x01) === 1;
};

/**
 * @public
 * Get the icon id for a particular unit type.
 */
export const getUnitIcon = (unit: DumpedUnit) => {
    if (
        (unit.extras!.dat.isBuilding &&
            !unit.extras!.dat.isZerg &&
            unitIsComplete(unit) &&
            unit.buildQueue?.length) ||
        (unit.extras!.dat.isZerg &&
            !unit.extras!.dat.isBuilding &&
            unit.buildQueue?.length)
    ) {
        return unit.buildQueue[0];
    }

    if (unitIsComplete(unit) && unit.remainingTrainTime) {
        if (unit.typeId === enums.unitTypes.reaver) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return enums.unitTypes.scarab;
        } else if (unit.typeId === enums.unitTypes.carrier) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return enums.unitTypes.interceptor;
        } else if (unit.typeId === enums.unitTypes.nuclearSilo) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return enums.unitTypes.nuclearMissile;
        }
    }

    return null;
};

const mapUnitInProduction = (input: Int32Array, unit: UnitDAT) =>
    unit.isTurret
        ? null
        : {
              typeId: input[0],
              icon: input[0],
              count: input[1],
              progress: input[2]! / unit.buildTime,
              isUnit: true,
          };

const mapUpgradeInProduction = (input: Int32Array, upgrade: UpgradeDAT) => ({
    typeId: input[0],
    icon: upgrade.icon,
    level: input[1],
    isUpgrade: true,
    progress:
        input[2]! / (upgrade.researchTimeBase + upgrade.researchTimeFactor * input[1]!),
});

const mapResearchInProduction = (input: Int32Array, research: TechDataDAT) => ({
    typeId: input[0],
    icon: research.icon,
    progress: input[1]! / research.researchTime,
    isResearch: true,
});

const _useProduction = (state: StateMessage) => state.production!;
/**
 * @public
 * Returns three functions that can be used to get player production information.
 * Units, Upgrades and Research.
 */
export const useProduction = () => {
    const { unitProduction, upgrades, research } = useStore(_useProduction);

    return [
        (playerId: number) =>
            chunk(unitProduction[playerId]!, 3)
                .map((unit) => mapUnitInProduction(unit, assets.bwDat.units[unit[0]!]!))
                .filter((unit) => unit),

        (playerId: number) =>
            chunk(upgrades[playerId]!, 3).map((upgrade) =>
                mapUpgradeInProduction(upgrade, assets.bwDat.upgrades[upgrade[0]!]!)
            ),
        (playerId: number) =>
            chunk(research[playerId]!, 2).map((research) =>
                mapResearchInProduction(research, assets.bwDat.tech[research[0]!]!)
            ),
    ];
};

/**
 * @public
 * Converts a frame numer to a time string eg 01:00.
 */
export const getFriendlyTime = (frame: number) => {
    const t = Math.floor((frame * 42) / 1000);
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);

    return `${minutes}:${`00${seconds}`.slice(-2)}`;
};

/**
 * @public
 */
export const openUrl = (url: string) =>
    window.parent.postMessage(
        {
            type: "system:open-url",
            payload: url,
        },
        "*"
    );

// plugin specific configuration
const useConfig = create<Record<string, object>>(() => ({}));

interface ComponentsStore {
    components: Component[];
    add: (component: Component) => void;
    remove: (id: string) => void;
}

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

const _plugins: Record<string, Plugin> = {};

const _removePlugin = (pluginId: string) => {
    const plugin = _plugins[pluginId] as Plugin | undefined;
    if (!plugin || pluginId !== plugin.id) {
        return;
    }

    useComponents.getState().remove(plugin.id);

    plugin.script.remove();

};

const _addPlugin = (plugin: PluginMetaData) => {
    console.log("@runtime/loading-plugin", plugin.name);
    if (!plugin.urls.ui) {
        return;
    }

    // initialize the plugin channels custom script and we'll later wait for it to register
    const script = document.createElement("script");
    script.type = "module";
    script.async = true;
    script.src = `${plugin.urls.ui}?=${Math.random()}`;
    document.head.appendChild(script);

    _plugins[plugin.id] = {
        id: plugin.id,
        messageHandler: new EventTarget(),
        script,
    };

    useConfig.setState({
        [plugin.id]: plugin.config,
    });
};
/**
 * @public
 * Images and game data.
 */
export type RuntimeAssets = Pick<SystemReadyMessage["assets"], "bwDat">;
/**
 * @public
 * Images and game data.
 */
export const assets: RuntimeAssets = {} as RuntimeAssets;
/**
 * @public
 * Enums and data for game types.
 */
export const enums: any = {};

// TODO: export enums type defs
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

/**
 * @public
 * A number that rolls up and down quickly like a casino slot.
 */
export const RollingNumber = ({
    value,
    upSpeed,
    downSpeed,
    ...props
}: {
    value: number;
    upSpeed: number | undefined;
    downSpeed: number | undefined;
}) => {
    const numberRef = useRef<HTMLSpanElement>(null);
    const rollingNumber = useRef(
        new RollingValue(value, upSpeed ?? 80, downSpeed ?? 30)
    );

    useEffect(() => {
        if (numberRef.current) {
            numberRef.current.textContent = `${value}`;
        }
    }, []);

    useEffect(() => {
        rollingNumber.current.start(value, (val) => {
            if (numberRef.current) {
                numberRef.current.textContent = `${val}`;
            }
        });

        return () => {
            rollingNumber.current.stop();
        };
    }, [value]);

    return <span ref={numberRef} {...props}></span>;
};

/**
 * @public
 * Player information.
 */
export class PlayerInfo {
    _struct_size = 7;
    playerId = 0;
    playerData: Required<StateMessage>["production"]["playerData"] = new Int32Array();

    get _offset() {
        return this._struct_size * this.playerId;
    }

    get minerals() {
        return this.playerData[this._offset + 0] ?? 0;
    }

    get vespeneGas() {
        return this.playerData[this._offset + 1] ?? 0;
    }
    get supply() {
        return this.playerData[this._offset + 2] ?? 0;
    }

    get supplyMax() {
        return this.playerData[this._offset + 3] ?? 0;
    }

    get workerSupply() {
        return this.playerData[this._offset + 4] ?? 0;
    }

    get armySupply() {
        return this.playerData[this._offset + 5] ?? 0;
    }

    get apm() {
        return this.playerData[this._offset + 6] ?? 0;
    }
}

const playerInfo = new PlayerInfo();
const getPlayerInfo = (
    playerId: number,
    playerData: Required<StateMessage>["production"]["playerData"]
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
        --minimap-matrix: matrix3d(${dimensions.matrix.join(",")});
      }`
    );
};

const PluginContext = createContext<Component | null>(null);

/**
 * @public
 * Receive ipc messages from your native plugin.
 */
export const useMessage = (cb?: (event: any) => void, deps: unknown[] = []) => {
    const { messageHandler } = useContext(PluginContext)!;

    useEffect(() => {
        const handler = ({ detail }: any) => {
            typeof cb === "function" && cb(detail);
        };
        messageHandler.addEventListener("message", handler);
        return () => messageHandler.removeEventListener("message", handler);
    }, [...deps, cb, messageHandler]);
};

/**
 * @public
 * Send ipc messages to your native plugin.
 */
export const useSendMessage = () => {
    const { pluginId } = useContext(PluginContext)!;

    return (message: unknown) =>
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

/**
 * @public
 * Get your users plugin configuration.
 */
export const usePluginConfig = () => {
    const { pluginId } = useContext(PluginContext)!;
    return useConfig((store) => store[pluginId]);
};

/**
 * @public
 * Set a global stylesheet.
 */
export const useStyleSheet = (content: string, deps = []) => {
    const { pluginId } = useContext(PluginContext)!;
    useEffect(() => {
        setPluginStyleSheet(pluginId, content);
    }, [content, ...deps]);

    useEffect(() => {
        return () => removePluginStylesheet(pluginId);
    }, []);
};

/**
 * @public
 */
export const proxyFetch = (url: string) => fetch(`?proxy=${encodeURIComponent(url)}`);

export const _rc = (
    pluginId: string,
    component: Component,
    JSXElement: React.FC<any>
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

const PluginComponent = ({
    key,
    JSXElement,
}: {
    key: string | number;
    JSXElement: Component["JSXElement"];
}) => {
    const config = usePluginConfig() as { _visible: boolean };
    return (
        <ErrorBoundary key={key}>
            <div style={{ display: config._visible ? "block" : "none" }}>
                <JSXElement />
            </div>
        </ErrorBoundary>
    );
};

const orderSort = (a: Component, b: Component) => {
    return a.order! - b.order!;
};

const App = ({ components }: { components: Component[] }) => {
    const { screen } = useStore(_screenSelector)!;
    const containerDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerDiv.current) return;

        if (["@home", "@loading"].includes(screen as string)) {
            containerDiv.current.style.opacity = "1";
        } else {
            let opacity = 0;
            const cancelId = setInterval(() => {
                opacity += 0.025;
                containerDiv.current!.style.opacity = `${Math.min(opacity, 1)}`;
                if (opacity >= 1) {
                    clearInterval(cancelId);
                }
            }, 50);
            return () => clearInterval(cancelId);
        }
    }, [screen]);

    const renderComponent = (component: Component) => (
        <PluginContext.Provider value={component}>
            <PluginComponent key={component.id} JSXElement={component.JSXElement} />
        </PluginContext.Provider>
    );

    return (
        <>
            {/* <Canvas style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            zIndex: 0,
            backgroundColor: "transparent",
        }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
        </Canvas> */}
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
                    backgroundColor: "transparent",

                    zIndex: 1,
                }}>
                <div
                    id="top-container"
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                    }}>
                    <div
                        id="top-left"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                        }}>
                        {components
                            .filter((c) => c.snap === "top-left")
                            .sort(orderSort)
                            .map(renderComponent)}
                    </div>
                    <div
                        id="top"
                        style={{
                            display: "flex",
                            flexGrow: 1,
                        }}>
                        {components
                            .filter((c) => c.snap === "top")
                            .sort(orderSort)
                            .map(renderComponent)}
                    </div>
                    <div
                        id="top-right"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                        }}>
                        {components
                            .filter((c) => c.snap === "top-right")
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
                    }}>
                    <div
                        id="left"
                        style={{
                            display: "flex",
                            flexDirection: "column-reverse",
                            // marginBottom: "var(--minimap-height)",
                        }}>
                        {components
                            .filter((c) => c.snap === "left")
                            .sort(orderSort)
                            .map(renderComponent)}
                    </div>
                    <div
                        id="center_container"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                        }}>
                        <div
                            id="center"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexGrow: 1,
                            }}>
                            {components
                                .filter((c) => c.snap === "center")
                                .sort(orderSort)
                                .map(renderComponent)}
                        </div>
                        <div
                            id="bottom"
                            style={{
                                display: "flex",
                            }}>
                            {components
                                .filter((c) => c.snap === "bottom")
                                .sort(orderSort)
                                .map(renderComponent)}
                        </div>
                    </div>
                    <div
                        id="right"
                        style={{ display: "flex", flexDirection: "column-reverse" }}>
                        {components
                            .filter((c) => c.snap === "right")
                            .sort(orderSort)
                            .map(renderComponent)}
                    </div>
                </div>

                {components
                    .filter((c) => c.snap === "loose")
                    .sort(orderSort)
                    .map(renderComponent)}
            </div>
        </>
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

// function Box(props: any) {
//   // This reference will give us direct access to the mesh
//   const meshRef = useRef()
//   // Set up state for the hovered and active state
//   const [hovered, setHover] = useState(false)
//   const [active, setActive] = useState(false)
//   // Subscribe this component to the render-loop, rotate the mesh every frame
//   r3fUseFrame((_, delta: number) => (meshRef.current.rotation.x += delta))
//   // Return view, these are regular three.js elements expressed in JSX
//   return (
//     <mesh
//       {...props}
//       ref={meshRef}
//       scale={active ? 1.5 : 1}
//       onClick={(event) => setActive(!active)}
//       onPointerOver={(event) => setHover(true)}
//       onPointerOut={(event) => setHover(false)}>
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
//     </mesh>
//   )
// }

/**
 * Core of runtime, listens for messages from the plugin ui manager.
 */
window.addEventListener("message", function (event: MessageEvent) {
    if (event.data.type.startsWith("system:")) {
        if (event.data.type === "system:ready") {
            const payload = event.data.payload as SystemReadyMessage;
            useStore.setState(payload.initialStore);

            updateDimensionsCss(payload.initialStore.dimensions);

            Object.assign(assets, payload.assets);

            Object.assign(enums, event.data.payload.enums);

            event.data.payload.plugins.forEach(_addPlugin);
            ReactDOM.render(<AppWrapper />, document.body);
        } else if (event.data.type === "system:plugins-enabled") {
            event.data.payload.forEach(_addPlugin);
        } else if (event.data.type === "system:plugin-disabled") {
            _removePlugin(event.data.payload as string);
        } else if (event.data.type === "system:plugin-config-changed") {
            useConfig.setState({
                [event.data.payload.pluginId]: event.data.payload.config as object,
            });
        } else if (event.data.type === "system:mouse-click") {
            const { clientX, clientY, button, shiftKey, ctrlKey } = event.data
                .payload as MouseEvent;

            const element = document.elementFromPoint(clientX, clientY)!;
            ReactTestUtils.Simulate.click(element, {
                button,
                shiftKey,
                ctrlKey,
                clientX,
                clientY,
            });
        } else if (event.data.type === "system:custom-message") {
            const { message, pluginId } = event.data.payload as {
                message: object;
                pluginId: string;
            };
            const plugin = _plugins[pluginId];
            if (plugin) {
                const event = new CustomEvent("message", { detail: message });
                plugin.messageHandler.dispatchEvent(event);
            }
        }
    } else {
        if (event.data.type === "dimensions") {
            updateDimensionsCss(event.data.payload as MinimapDimensions);
        }
        useStore.setState({ [event.data.type]: event.data.payload as unknown });
    }
});

ReactDOM.render(<AppWrapper />, document.body);

// const canvas = document.createElement("canvas");
// const offscreen = canvas.transferControlToOffscreen();

window.parent.postMessage(
    {
        type: "system:runtime-ready",
        // payload: offscreen,
    },
    "*"
    // [offscreen]
);
