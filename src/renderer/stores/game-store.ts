import create  from "zustand";
import { MinimapDimensions } from "@render/minimap-dimensions";
import { Assets } from "@image/assets";
import { waitForTruthy } from "@utils/wait-for";
import { useSettingsStore } from "@stores/settings-store";

export interface GameStore {
    assetServerUrl: string;
    pluginRepositoryUrl: string;
    uiRuntimeUrl: string;
    assets: Assets | null;
    dimensions: MinimapDimensions;
    setAssets: ( assets: Assets | null ) => void;
    setDimensions: ( dimensions: MinimapDimensions ) => void;
    configurationWindow: Window | null;
    configurationWindowDeps: { useSettingsStore: typeof useSettingsStore } | null;
    openConfigurationWindow: () => void;
}
const pluginUrl =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8090/"
        : "https://plugins-o8a.pages.dev/";

export const useGameStore = create<GameStore>( ( set, get ) => ( {
    assetServerUrl: "",
    pluginRepositoryUrl: pluginUrl,
    uiRuntimeUrl: pluginUrl + "runtime.html",
    assets: null,
    configurationWindow: null,
    configurationWindowDeps: null,
    openConfigurationWindow() {
        if ( get().configurationWindow ) {
            return;
        }
        const w = window.open( "/configuration.html", "_blank" );
        if ( !w ) return;

        set( { configurationWindow: w, configurationWindowDeps: { useSettingsStore } } );

        w.addEventListener( "beforeunload", () => {
            set( { configurationWindow: null } );
        } );
    },
    dimensions: {
        matrix: [],
        minimapWidth: 0,
        minimapHeight: 0,
    },
    setAssets: ( assets: Assets | null ) => set( { assets } ),

    setDimensions: ( dimensions: MinimapDimensions ) => set( { dimensions } ),
} ) );

export async function setAsset<T extends keyof Assets>( key: T, asset: Assets[T] ) {
    await waitForTruthy( () => useGameStore.getState().assets !== null );
    const assets = useGameStore.getState().assets!;

    useGameStore.setState( {
        assets: {
            ...assets,
            [key]: asset,
            remaining: assets.remaining - 1,
        },
    } );

    if ( useGameStore.getState().assets!.remaining < 0 ) {
        throw new Error( "Remaining assets is less than 0" );
    }
}

export default () => useGameStore.getState();
