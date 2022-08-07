import { PostProcessingBundleDTO, Settings } from "common/types";
import { Camera } from "three";
import { version } from "../../../package.json";
import { renderComposer } from "@render";
import * as log from "@ipc/log";

export const anisotropyOptions = {
    max: 1,
    med: 1,
    low: 1
};

export const rendererIsDev = process.env.NODE_ENV === "development";

export const getPixelRatio = (pixelRatio: Settings["graphics"]["pixelRatio"]) => {
    const pixelRatios = {
        high: window.devicePixelRatio,
        med: 1,
        low: 0.75
    };
    return pixelRatios[pixelRatio]
}

export const updatePostProcessingCamera = (bundle: Pick<PostProcessingBundleDTO, "effects" | "passes">, camera: Camera, renderLastPassToScreen: boolean) => {
    let lastPass: any = null;

    for (const pass of bundle.passes) {
        //@ts-ignore
        pass.camera = camera;
        pass.renderToScreen = false;
        if (pass.enabled) {
            lastPass = pass;
        }
    }
    lastPass.renderToScreen = renderLastPassToScreen;

    for (const effect of bundle.effects) {
        // @ts-ignore
        if (effect.camera) {
            // @ts-ignore
            effect.camera = camera;
        }
    }

}

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

    anisotropyOptions.max = r.capabilities.getMaxAnisotropy();
    anisotropyOptions.med = Math.floor(r.capabilities.getMaxAnisotropy() / 2);

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