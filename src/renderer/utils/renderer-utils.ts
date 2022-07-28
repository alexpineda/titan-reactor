import { PostProcessingBundleDTO, Settings } from "common/types";
import { Camera, WebGLRenderer } from "three";

const renderer = new WebGLRenderer();
const high = renderer.capabilities.getMaxAnisotropy();
renderer.dispose();

export const anisotropyOptions = {
    max: high,
    med: Math.floor(high / 2),
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