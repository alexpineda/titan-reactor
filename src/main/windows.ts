import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "path";
// import { pathToFileURL } from "url";
import { ROOT_PATH } from "./root-path";

const browserWindows = {} as {
    main: null | BrowserWindow;
    config: null | BrowserWindow;
    iscriptah: null | BrowserWindow;
};

interface CreateWindowArgs {
    onClose?: () => void;
    removeMenu?: boolean;
    hideMenu?: boolean;
    devTools?: boolean;
    backgroundColor?: string;
    nodeIntegration?: boolean;
    backgroundThrottling?: boolean;
    preloadFile?: string | undefined;
    filepath: string;
}

const createDefaultArgs = ( args: CreateWindowArgs ) =>
    Object.assign(
        {},
        {
            onClose: () => {},
            query: "",
            removeMenu: false,
            hideMenu: false,
            backgroundColor: "#242526",
            nodeIntegration: false,
            devTools: false,
            backgroundThrottling: true,
            preloadFile: undefined,
        },
        args
    );

export const createWindow = ( createWindowArgs: CreateWindowArgs ) => {
    const {
        onClose,
        removeMenu,
        hideMenu,
        devTools,
        backgroundColor,
        nodeIntegration,
        backgroundThrottling,
        preloadFile,
        filepath,
    } = createDefaultArgs( createWindowArgs );

    let preload: string | undefined = undefined;

    if ( preloadFile ) {
        if ( isDev ) {
            preload = path.resolve(
                __dirname,
                "..\\..",
                "dist",
                "main",
                `${preloadFile}.js`
            );
        } else {
            preload = path.resolve( __dirname, `${preloadFile}.js` );
        }
    }

    const w = new BrowserWindow( {
        width: 800,
        height: 600,
        backgroundColor,
        show: false,
        webPreferences: {
            nodeIntegration,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            webSecurity: true,
            spellcheck: false,
            enableWebSQL: false,
            contextIsolation: !!preload,
            defaultFontSize: 14,
            backgroundThrottling,
            preload,
        },
    } );
    w.setAutoHideMenuBar( hideMenu );

    if ( removeMenu ) {
        w.removeMenu();
    }

    if ( isDev ) {
        w.loadURL( `${process.env.VITE_DEV_SERVER_URL!}${filepath}` );
    } else {
        w.loadURL( path.join( ROOT_PATH.dist, filepath ) );
    }

    // on(event: 'unresponsive', listener: Function): this;

    w.on( "ready-to-show", () => {
        w.show();
        if ( isDev && devTools ) {
            w.webContents.openDevTools();
        }
    } );

    w.on( "closed", onClose );

    w.webContents.on( "devtools-opened", () => {
        w.focus();
        setImmediate( () => {
            w.focus();
        } );
    } );

    return w;
};
export default browserWindows;
