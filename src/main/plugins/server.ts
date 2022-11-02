import path, { normalize } from "path";
import fs from "fs";
import express from "express";
import { transpile } from "../transpile";
import browserWindows from "../windows";
import { LOG_MESSAGE, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import settings from "../settings/singleton";
import { fileExists } from "common/utils/file-exists";
import { logService } from "../logger/singleton";
import fetch from "node-fetch";
import * as casclib from "bw-casclib";
import runtimeHTML from "./runtime.html?raw";
import runtimeJSX from "./runtime.tsx?raw";
import { ROOT_PATH } from "../root-path";

const BUNDLED_SUBPATH = path.normalize( "/bundled/" );
const RESOURCES_PATH = path.normalize( ROOT_PATH.public );

let _handle: any = null;
const app = express();

app.use( function ( _, res, next ) {
    res.setHeader( "Origin-Agent-Cluster", "?1" );
    res.setHeader( "Access-Control-Allow-Origin", "*" );
    next();
} );

app.get( "*", async function ( req, res ) {
    if ( req.url.startsWith( "/m_api" ) ) {
        if ( req.method === "GET" ) {
            if ( req.query.iconPNG ) {
                const icon = Number( req.query.iconPNG );

                if ( _handle === null ) {
                    _handle = ( await casclib.openStorage(
                        settings.get().directories.starcraft
                    ) ) as unknown;
                }
                const data = await casclib.readFile(
                    _handle,
                    `webui/dist/lib/images/cmdicons.${icon}.png`
                );

                res.setHeader( "Content-Type", "image/png" );
                res.send( data );
                res.end();
                return;
                // POST wasn't working
            } else if ( req.query.macroId ) {
                browserWindows.main!.webContents.send(
                    SERVER_API_FIRE_MACRO,
                    req.query.macroId
                );
                return res.status( 200 ).send();
            }

            try {
                req.headers;
                const lastRevision = req.headers["X-LastRevision"];
                if ( lastRevision === `${settings.get().macros.revision}` ) {
                    res.status( 304 ).send();
                    return;
                }
            } catch ( e ) {}
            res.setHeader( "Content-Type", "application/json" );
            res.send( settings.get().macros );
        }
        return;
    }

    if ( req.query.proxy ) {
        const proxy = req.query.proxy;
        const response = await fetch( proxy as string );

        res.status( response.status );
        if ( response.headers.has( "content-type" ) ) {
            res.setHeader( "Content-Type", response.headers.get( "content-type" )! );
        }
        const text = await response.text();
        res.send( text );
        return;
    }

    const requestPath = normalize( req.path );

    //TODO: remove once everything is finalized
    logService.debug( `@server: ${requestPath}, ${RESOURCES_PATH}, ${BUNDLED_SUBPATH}` );

    if ( requestPath.startsWith( BUNDLED_SUBPATH ) ) {
        const filepath = path.normalize(
            path.join( RESOURCES_PATH, requestPath.replace( BUNDLED_SUBPATH, "" ) )
        );

        logService.debug( `sending ${filepath}` );

        if ( !filepath.startsWith( RESOURCES_PATH ) ) {
            logService.error( `@server/403-forbidden: ${filepath}` );

            return res.sendStatus( 403 );
        }

        return res.sendFile( filepath );
    } else if ( requestPath.endsWith( "runtime.html" ) ) {
        res.setHeader( "Content-Type", "text/html" );
        return res.send( runtimeHTML );
    } else if ( requestPath.endsWith( "runtime.tsx" ) ) {
        const { result } = transpile( runtimeJSX, "runtime.tsx", "runtime.tsx" );
        res.setHeader( "Content-Type", "application/javascript" );
        return res.send( result.outputText );
    }

    const filepath = path.normalize(
        path.join( settings.get().directories.plugins, req.path )
    );

    if ( !filepath.startsWith( path.normalize( settings.get().directories.plugins ) ) ) {
        logService.error( `@server/403-forbidden: ${filepath}` );
        return res.sendStatus( 403 );
    }

    if ( !( await fileExists( filepath ) ) ) {
        logService.error( `@server/404-not-exists: ${filepath}` );
        return res.sendStatus( 404 );
    }

    if ( filepath.endsWith( ".jsx" ) || filepath.endsWith( ".tsx" ) ) {
        const { result, transpileErrors } = transpile(
            fs.readFileSync( filepath, "utf8" ),
            filepath,
            filepath
        );

        let content = result.outputText;
        let plugin;
        for ( const _plugin of settings.enabledPlugins ) {
            if (
                filepath.startsWith(
                    path.normalize(
                        path.join( settings.get().directories.plugins, _plugin.path )
                    )
                )
            ) {
                plugin = _plugin;
            }
        }

        if ( !plugin ) {
            return res.sendStatus( 404 );
        }

        if ( content ) {
            content = `
            import { _rc } from "titan-reactor-runtime";
            const registerComponent = (...args) => _rc("${plugin.id}", ...args);
            ${content}
            `;
        }

        res.setHeader( "Content-Type", "application/javascript" );

        if ( transpileErrors.length === 0 ) {
            res.send( content );
        } else {
            const message = `@plugin-server: transpile error - ${transpileErrors[0].message} ${transpileErrors[0].snippet}`;
            browserWindows.main?.webContents.send( LOG_MESSAGE, message, "error" );
            logService.error( `@server/500-transpile-error: ${message}` );
            return res.sendStatus( 500 );
        }
    } else {
        res.sendFile( filepath );
    }
} );

export default app;
