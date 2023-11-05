import create from "zustand";
import { MinimapDimensions } from "@render/minimap-dimensions";
import { Assets } from "@image/assets";
import { waitForTruthy } from "@utils/wait-for";

export interface GameStore {
    assetServerUrl: string;
    pluginRepositoryUrls: string[];
    assets: Assets | null;
    dimensions: MinimapDimensions;
    setAssets: ( assets: Assets | null ) => void;
    setDimensions: ( dimensions: MinimapDimensions ) => void;
    configurationWindow: Window | null;
    openConfigurationWindow: () => void;
}
export const useGameStore = create<GameStore>( ( set, get ) => ( {
    assetServerUrl: "",
    pluginRepositoryUrls: [ import.meta.env.VITE_OFFICIAL_PLUGINS_SERVER_URL ],
    assets: null,
    configurationWindow: null,
    configurationWindowDeps: null,
    openConfigurationWindow() {
        if ( get().configurationWindow ) {
            get().configurationWindow?.close();
        }
        const w = window.open( "/configuration.html", "_blank" );
        w!.blur();
        window.focus();
        if ( !w ) return;
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
        },
    } );

}

export default () => useGameStore.getState();
