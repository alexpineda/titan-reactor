import { version } from "../../../package.json";
import { renderComposer } from "@render";
import { log } from "@ipc/log";

export const logCapabilities = () => {
    log.info(`@init: titan-reactor ${version}`);
    log.info(`@init: chrome ${process.versions.chrome}`);
    log.info(`@init: electron ${process.versions.electron}`);
    log.info(`@init: resolution ${window.innerWidth}x${window.innerHeight}`);

    const r = renderComposer.getWebGLRenderer();
    log.verbose(`@init: webgl capabilities`);
    for (const prop of Object.getOwnPropertyNames(r.capabilities)) {
        const value = r.capabilities[prop as keyof typeof r.capabilities];
        if (typeof value === "function") continue;
        log.verbose(`- ${prop}: ${value}`);
    }

    log.verbose(`- anisotropy: ${r.capabilities.getMaxAnisotropy()}`);
    log.verbose(`- max precision: ${r.capabilities.getMaxPrecision("highp")}`);
    log.verbose("webgl extensions");
    log.verbose(
        `- EXT_color_buffer_float ${r.extensions.has("EXT_color_buffer_float")}`
    );
    log.verbose(
        `- OES_texture_float_linear ${r.extensions.has("OES_texture_float_linear")}`
    );
    log.verbose(
        `- EXT_color_buffer_half_float ${r.extensions.has(
            "EXT_color_buffer_half_float"
        )}`
    );
    log.verbose(
        `- WEBGL_multisampled_render_to_texture ${r.extensions.has(
            "WEBGL_multisampled_render_to_texture"
        )}`
    );

    r.extensions.init(r.capabilities);

    log.verbose(`@init: device pixel ratio: ${window.devicePixelRatio}`);
}