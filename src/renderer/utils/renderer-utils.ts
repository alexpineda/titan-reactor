import { Settings } from "common/types";
import { WebGLRenderer } from "three";

const renderer = new WebGLRenderer();
const high = renderer.capabilities.getMaxAnisotropy();
renderer.dispose();

export const anisotropyOptions = {
    max: high,
    med: Math.floor(high / 2),
    low: 1
};

export const rendererIsDev = process.env.NODE_ENV === "development";

export const getPixelRatio = (settings: Settings) => {
    const pixelRatios = {
        high: window.devicePixelRatio,
        med: 1,
        low: 0.75
    };
    return pixelRatios[settings.graphics.pixelRatio]
}