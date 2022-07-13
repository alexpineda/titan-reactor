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
