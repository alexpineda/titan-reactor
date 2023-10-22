import path, { normalize } from "path";
import fs from "fs";
import express from "express";
import { transpile } from "../typescript/transpile";
import settings from "../settings/singleton";
import { fileExists } from "common/utils/file-exists";
import { logService } from "../logger/singleton";
import fetch from "node-fetch";
import runtimeHTML from "inline:./runtime.html";
import runtimeJSX from "inline:./runtime.tsx";
import { BUNDLED_SUBPATH, PLUGIN_PATH, RESOURCES_PATH } from "../tmp-main";
import { UI_PORT } from "common/tmp-common";

// let _handle: any = null;
const app = express();

app.use( function ( _, res, next ) {
    res.setHeader( "Origin-Agent-Cluster", "?1" );
    res.setHeader( "Access-Control-Allow-Origin", "*" );
    next();
} );

app.get( "*", async function ( req, res ) {
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

    if ( requestPath.endsWith( "runtime.html" ) ) {
        res.setHeader( "Content-Type", "text/html" );
        return res.send( runtimeHTML );
    } else if ( requestPath.endsWith( "runtime.tsx" ) ) {
        const { result } = transpile( runtimeJSX, "runtime.tsx", "runtime.tsx" );
        res.setHeader( "Content-Type", "application/javascript" );
        return res.send( result.outputText );
    }

    const filepath = path.normalize( path.join( PLUGIN_PATH, req.path ) );

    if ( !filepath.startsWith( path.normalize( PLUGIN_PATH ) ) ) {
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
        for ( const _plugin of settings.activatedPlugins ) {
            if (
                filepath.startsWith(
                    path.normalize( path.join( PLUGIN_PATH, _plugin.path ) )
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
            import { _rc } from "@titan-reactor-runtime/ui";
            const registerComponent = (...args) => _rc("${plugin.id}", ...args);
            ${content}
            `;
        }

        res.setHeader( "Content-Type", "application/javascript" );

        if ( transpileErrors.length === 0 ) {
            res.send( content );
        } else {
            const message = `@plugin-server: transpile error - ${transpileErrors[0].message} ${transpileErrors[0].snippet}`;
            // browserWindows.main?.webContents.send( LOG_MESSAGE_REMOTE, message, "error" );
            logService.error( `@server/500-transpile-error: ${message}` );
            return res.sendStatus( 500 );
        }
    } else {
        res.sendFile( filepath );
    }
} );

app.listen( UI_PORT, "localhost" );
console.log( `@ui-server: listening on port ${UI_PORT}` );
