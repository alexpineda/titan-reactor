import { version } from "../../../package.json";
import { getWebGLRenderer } from "@render/render-composer";
import { log } from "@ipc/log";

export const logCapabilities = () => {
    log.info( `@init: titan-reactor ${version}` );
    log.info( `@init: chrome ${process.versions.chrome}` );
    log.info( `@init: electron ${process.versions.electron}` );
    log.info( `@init: resolution ${window.innerWidth}x${window.innerHeight}` );

    getWebGLRenderer(r => {
        log.debug( "@init: webgl capabilities" );
        for ( const prop of Object.getOwnPropertyNames( r.capabilities ) ) {
            const value = r.capabilities[prop as keyof typeof r.capabilities];
            if ( typeof value === "function" ) continue;
            log.debug( `- ${prop}: ${value}` );
        }
    
        log.debug( `- anisotropy: ${r.capabilities.getMaxAnisotropy()}` );
        log.debug( `- max precision: ${r.capabilities.getMaxPrecision( "highp" )}` );
        log.debug( "webgl extensions" );
        log.debug( `- EXT_color_buffer_float ${r.extensions.has( "EXT_color_buffer_float" )}` );
        log.debug(
            `- OES_texture_float_linear ${r.extensions.has( "OES_texture_float_linear" )}`
        );
        log.debug(
            `- EXT_color_buffer_half_float ${r.extensions.has(
                "EXT_color_buffer_half_float"
            )}`
        );
        log.debug(
            `- WEBGL_multisampled_render_to_texture ${r.extensions.has(
                "WEBGL_multisampled_render_to_texture"
            )}`
        );
    
        r.extensions.init( r.capabilities );
    
        log.debug( `@init: device pixel ratio: ${window.devicePixelRatio}` );
    })


};
