import { app, powerSaveBlocker, dialog, nativeTheme } from "electron";
import path from "path";

import "./register-ipc-handlers";
import createAppMenu from "./create-app-menu";

import windows, { createWindow } from "./windows";
import settings from "./settings/singleton";
import getUserDataPath from "./get-user-data-path";
import pluginServer from "./plugins/server";
import browserWindows from "./windows";
import { getBootupLogs } from "./log";
import { GO_TO_START_PAGE, LOG_MESSAGE } from "common/ipc-handle-names";

const settingsPath = path.join( getUserDataPath(), "settings.json" );

const gotTheLock = app.requestSingleInstanceLock();

const createMainWindow = () => {
    if ( windows.main ) {
        if ( windows.main.isMinimized() ) windows.main.restore();
        windows.main.focus();
        return;
    }

    windows.main = createWindow( {
        onClose: () => {
            windows.main = null;
            windows.config?.close();
        },
        backgroundColor: "#000000",
        nodeIntegration: true,
        devTools: true,
        backgroundThrottling: false,
        hideMenu: true,
        removeMenu: false,
        filepath: "index.html",
    } );
    windows.main.maximize();
};

const createConfigurationWindow = () => {
    if ( windows.config ) {
        if ( windows.config.isMinimized() ) windows.config.restore();
        windows.config.focus();
        return;
    }

    windows.config = createWindow( {
        onClose: () => {
            windows.config = null;
        },
        nodeIntegration: true,
        removeMenu: true,
        backgroundThrottling: true,
        devTools: true,
        filepath: "command-center.html",
    } );
    windows.config.title = "Configuration Panel";
    windows.config.minimize();
};

if ( !gotTheLock ) {
    app.quit();
} else {
    const psbId = powerSaveBlocker.start( "prevent-display-sleep" );

    app.commandLine.appendSwitch( "enable-features", "SharedArrayBuffer" );
    app.commandLine.appendSwitch( "force_high_performance_gpu" );
    app.commandLine.appendSwitch( "disable-xr-sandbox" );
    app.commandLine.appendSwitch( "strict-origin-isolation" );
    app.commandLine.appendSwitch( "js-flags", "--expose-gc" );
    app.commandLine.appendSwitch( "--disable-gpu-process-crash-limit" );
    // app.commandLine.appendSwitch("--disable-frame-rate-limit")
    app.disableDomainBlockingFor3DAPIs();

    nativeTheme.themeSource = "light";

    createAppMenu(
        () => createConfigurationWindow(),
        () => {
            windows.main?.webContents.send( GO_TO_START_PAGE );
        },
        () => {
            createWindow( {
                onClose: () => {
                    windows.config = null;
                },
                nodeIntegration: true,
                removeMenu: true,
                backgroundThrottling: true,
                devTools: true,
                filepath: "iscriptah.html",
            } );
        }
    );

    if ( process.defaultApp ) {
        if ( process.argv.length >= 2 ) {
            app.setAsDefaultProtocolClient(
                "titan-reactor",
                process.execPath,
                process.argv.slice( 1 )
            );
        }
    } else {
        app.setAsDefaultProtocolClient( "titan-reactor" );
    }

    app.on( "second-instance", () => {
        if ( windows.main ) {
            if ( windows.main.isMinimized() ) windows.main.restore();
            windows.main.focus();
        }
    } );

    app.on( "open-url", ( _, url ) => {
        dialog.showErrorBox( "Welcome Back", `You arrived from: ${url}` );
    } );

    app.on( "ready", async () => {
        await settings.init( settingsPath );

        createMainWindow();

        // on window ready send bootup logs
        const _readyToShowLogs = () => {
            for ( const log of getBootupLogs() ) {
                browserWindows.main?.webContents.send(
                    LOG_MESSAGE,
                    log.message,
                    log.level
                );
            }
            browserWindows.main?.off( "ready-to-show", _readyToShowLogs );
        };
        browserWindows.main?.on( "ready-to-show", _readyToShowLogs );
        browserWindows.main!.setFullScreen( true );

        pluginServer.listen( settings.get().plugins.serverPort, "localhost" );
    } );

    app.on( "window-all-closed", () => {
        if ( process.platform !== "darwin" ) {
            powerSaveBlocker.stop( psbId );
            app.quit();
        }
    } );

    app.on( "activate", () => {
        createMainWindow();
    } );

    app.on( "web-contents-created", ( _, contents ) => {
        // prevent navigation
        contents.on( "will-navigate", ( event ) => {
            event.preventDefault();
        } );

        // prevent new windows
        contents.setWindowOpenHandler( () => ( { action: "deny" } ) );
    } );
}
