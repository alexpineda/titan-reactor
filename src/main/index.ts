import { app, powerSaveBlocker, nativeTheme, crashReporter, Menu } from "electron";
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
import { logService } from "./logger/singleton";
import electronIsDev from "electron-is-dev";
import { initACLs } from "./acl";

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
        removeMenu: false,
        filepath: "index.html",
    } );
    // windows.main.maximize();
    windows.main.autoHideMenuBar = true;
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
        removeMenu: !electronIsDev,
        backgroundThrottling: false,
        devTools: true,
        filepath: "command-center.html",
    } );
    windows.config.title = "Configuration Panel";
    windows.config.minimize();
};

if ( !gotTheLock ) {
    app.quit();
} else {
    start();
}

async function start(){
    const psbId = powerSaveBlocker.start( "prevent-display-sleep" );

    app.commandLine.appendSwitch( "enable-features", "SharedArrayBuffer" );
    app.commandLine.appendSwitch( "force_high_performance_gpu" );
    app.commandLine.appendSwitch( "strict-origin-isolation" );
    app.commandLine.appendSwitch( "js-flags", "--expose-gc" );
    app.commandLine.appendSwitch( "disable-gpu-process-crash-limit" );
    app.commandLine.appendSwitch( "enable-logging=file" );
    app.commandLine.appendSwitch( "trace-warnings" );

    app.disableDomainBlockingFor3DAPIs();

    crashReporter.start( {
        productName: "titan-reactor",
        companyName: "imbateam",
        submitURL:
            "https://submit.backtrace.io/imbateam/6c0b4a6e4e557991c206cefa5ca48712c1a34e2f03f0d50c90672f034b58affc/minidump",
        uploadToServer: true,
    } );
    nativeTheme.themeSource = "light";

    await initACLs();

  

    app.on( "second-instance", () => {
        if ( windows.main ) {
            if ( windows.main.isMinimized() ) windows.main.restore();
            windows.main.focus();
        }
    } );

    await app.whenReady();
    
    const menuTemplate = createAppMenu(
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
    const menu = Menu.buildFromTemplate( menuTemplate );
    Menu.setApplicationMenu( menu );

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

    pluginServer.listen( settings.get().plugins.serverPort, "localhost" );

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

    app.on( "child-process-gone", ( _, details ) => {
        logService.error( details.reason );
    } );

    app.on( "render-process-gone", ( _, __, details ) => {
        logService.error( details.reason );
    } );
}
