import renderer from "./../render/renderer";

const high = renderer.getWebGLRenderer().capabilities.getMaxAnisotropy();
export const anisotropyOptions = {
    max: high,
    med: Math.floor(high / 2),
    low: 1
};
